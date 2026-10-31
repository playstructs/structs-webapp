import {fromBech32, toBech32, toBase64} from "@cosmjs/encoding";
import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {QueryClientImpl as StakingQuery} from "cosmjs-types/cosmos/staking/v1beta1/query";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {REACTOR_TRANSACTION} from "../constants/ReactorTransactions";
import {reactorIntent, exactAlphaAmount} from "../util/ReactorIntent";
import {transferAddress} from "../util/TransferIntent";
import {protocolAtHeight} from "../util/ChainProtocol";
import {readVaultFunding, collectVaultFunding} from "./VaultFunding";
import {legacyDecimalFromWire} from "../util/MessagePayload";

export function reactorValidatorAddress(value) {
  const parsed = fromBech32(value);
  if (parsed.prefix !== 'structsvaloper' || parsed.data.length !== 20
      || toBech32(parsed.prefix, parsed.data) !== value) throw new Error('Invalid reactor validator');
  return value;
}

/** Lists are address-scoped; complete empty pages prove absence without swallowing RPC errors. */
async function stakingRows(query, method, field, address) {
  let key = new Uint8Array();
  const seen = new Set();
  const rows = [];
  for (let page = 0; page < REACTOR_TRANSACTION.MAX_PAGES_PER_LIST; page++) {
    const result = await query[method]({delegatorAddr: address,
      pagination:{key,offset:0n,limit:100n,countTotal:false,reverse:false}});
    if (!Array.isArray(result[field]) || result[field].length > 100) throw new Error('Invalid staking page');
    rows.push(...result[field]);
    const next = result.pagination?.nextKey;
    if (!(next instanceof Uint8Array)) throw new Error('Staking pagination is unavailable');
    if (!next.length) return rows;
    const cursor = toBase64(next);
    if (seen.has(cursor)) throw new Error('Staking pagination repeated a cursor');
    seen.add(cursor);
    key = next;
  }
  throw new Error('Staking position exceeds the query page limit');
}

function indexedPositions(indexed, intent, vault, validator, height) {
  if (indexed.owner_id !== intent.ownerId || indexed.player_id !== intent.ownerId
      || indexed.destination_id !== intent.reactorId || indexed.validator !== validator
      || indexed.vault_address !== vault || indexed.positions_meta?.complete !== true
      || indexed.positions_meta.height !== height || !Array.isArray(indexed.positions)
      || indexed.positions.length > 1024) throw new Error('Complete indexed reactor positions are unavailable');
  const positions = new Map();
  for (const row of indexed.positions) {
    const address = transferAddress(row.address);
    if (row.owner_id !== intent.ownerId || row.validator !== validator || row.native_ready !== true
        || typeof row.is_vault !== 'boolean' || row.is_vault !== (address === vault)) {
      throw new Error('Indexed reactor position identity is invalid');
    }
    // An identical address/validator pair is one position, never additional stake.
    positions.set(address, {address,isVault:row.is_vault});
  }
  if (!positions.has(vault)) throw new Error('Player vault position is missing');
  return [...positions.values()].sort((a,b) => Number(b.isVault)-Number(a.isVault)
    || (a.address < b.address ? -1 : a.address > b.address ? 1 : 0));
}

export async function availableReactorStake(staking, address, validator, maxEntries) {
  const delegations = await stakingRows(staking, 'DelegatorDelegations', 'delegationResponses', address);
  const pairs = new Set();
  let amount = 0n;
  for (const row of delegations) {
    const delegation = row.delegation;
    if (delegation?.delegatorAddress !== address || pairs.has(delegation.validatorAddress)
        || row.balance?.denom !== 'ualpha') throw new Error('Invalid native delegation identity');
    reactorValidatorAddress(delegation.validatorAddress);
    legacyDecimalFromWire(delegation.shares);
    if (BigInt(delegation.shares) <= 0n) throw new Error('Invalid native delegation shares');
    pairs.add(delegation.validatorAddress);
    const balance = exactAlphaAmount(row.balance.amount);
    // The native query converts shares to whole ualpha. ValidateUnbondAmount
    // and actual signed simulation remain authoritative for share rounding.
    if (delegation.validatorAddress === validator) amount = balance;
  }
  if (amount === 0n) return 0n;
  const pending = await stakingRows(staking, 'DelegatorUnbondingDelegations', 'unbondingResponses', address);
  pairs.clear();
  for (const row of pending) {
    if (row.delegatorAddress !== address || pairs.has(row.validatorAddress) || !Array.isArray(row.entries)) {
      throw new Error('Invalid native unbonding identity');
    }
    reactorValidatorAddress(row.validatorAddress);
    pairs.add(row.validatorAddress);
    // Zero-balance, held and past-time entries all count until staking removes them.
    if (row.validatorAddress === validator && row.entries.length >= maxEntries) amount = 0n;
  }
  return amount;
}

/** Called within one indexed-height native snapshot; emits one complete atomic group or refuses. */
export async function prepareReactor(rpc, tx, indexed) {
  const intent = reactorIntent(tx.intent);
  const query = new StructsQuery(rpc);
  const permission = intent.direction === 'infuse' ? PERMISSIONS.TOKEN_INFUSE : PERMISSIONS.TOKEN_DEFUSE;
  const actor = await query.Address({address:tx.accountAddress});
  if (actor.address !== tx.accountAddress || actor.playerId !== intent.ownerId
      || typeof actor.permissions !== 'string' || !/^(0|[1-9][0-9]{0,19})$/.test(actor.permissions)
      || BigInt(actor.permissions) > 18446744073709551615n || (BigInt(actor.permissions) & BigInt(permission)) === 0n) {
    throw new Error('Signing address cannot perform this reactor change');
  }
  const player = (await query.Player({id:intent.ownerId})).Player;
  const guild = (await query.Guild({id:intent.guildId})).Guild;
  const reactor = (await query.Reactor({id:intent.reactorId})).Reactor;
  if (player?.id !== intent.ownerId || player.guildId !== intent.guildId || guild?.id !== intent.guildId
      || guild.primaryReactorId !== intent.reactorId || reactor?.id !== intent.reactorId) {
    throw new Error('The selected guild reactor changed');
  }
  const validator = reactorValidatorAddress(reactor.validator);
  const protocol = protocolAtHeight(rpc.chainId,rpc.height);
  const staking = new StakingQuery(rpc);
  const params = (await staking.Params({})).params;
  if (params?.bondDenom !== 'ualpha' || !Number.isInteger(params.maxEntries) || params.maxEntries < 1) {
    throw new Error('Staking admission parameters are unavailable');
  }
  let source = transferAddress(player.primaryAddress);
  if (protocol === CHAIN.PROTOCOL) {
    const vault = await query.Vault({ownerId:intent.ownerId});
    if (vault.ownerId !== intent.ownerId || typeof vault.provisioned !== 'boolean') throw new Error('Invalid reactor vault');
    source = transferAddress(vault.address);
  }
  const requested = exactAlphaAmount(intent.amount);
  const legs = [];
  let collection = null;
  if (intent.direction === 'infuse') {
    if (indexed.id !== intent.ownerId || (protocol === CHAIN.PROTOCOL && (indexed.vault_address !== source
        || indexed.funds_meta?.ready !== true || indexed.funds_meta.height !== rpc.height))) {
      throw new Error('Indexed reactor funding is unavailable');
    }
    if (protocol === CHAIN.PROTOCOL) {
      const funds = await readVaultFunding(rpc, intent.ownerId, source, actor, indexed, requested);
      collection = collectVaultFunding(funds, source, requested);
    } else {
      const balance = (await new BankQuery(rpc).SpendableBalanceByDenom({address:source,denom:'ualpha'})).balance;
      if (balance?.denom !== 'ualpha' || exactAlphaAmount(balance.amount) < requested) {
        throw new Error('Insufficient spendable Alpha');
      }
    }
    legs.push({address:source,isVault:protocol === CHAIN.PROTOCOL,amount:intent.amount});
  } else {
    const positions = protocol === CHAIN.PROTOCOL
      ? indexedPositions(indexed,intent,source,validator,rpc.height) : [{address:source,isVault:false}];
    let remaining = requested;
    let inspected = 0;
    for (const position of positions) {
      if (!remaining) break;
      if (++inspected > REACTOR_TRANSACTION.MAX_POSITIONS) throw new Error('Withdrawal exceeds the bounded position query');
      if (!position.isVault && position.address !== tx.accountAddress) {
        const owner = await query.Address({address:position.address});
        if (owner.address !== position.address) throw new Error('Invalid retained address lookup');
        if (owner.playerId !== intent.ownerId) continue;
      }
      const available = await availableReactorStake(staking,position.address,validator,params.maxEntries);
      const amount = available < remaining ? available : remaining;
      if (amount) {
        legs.push({...position,amount:amount.toString()});
        remaining -= amount;
      }
    }
    if (remaining) throw new Error('Eligible reactor positions cannot cover the complete withdrawal');
  }
  const typeUrl = intent.direction === 'infuse' ? '/structs.structs.MsgReactorInfuse' : '/structs.structs.MsgReactorDefuse';
  return {protocol, messages:[...(collection?.messages ?? []), ...legs.map(leg => ({typeUrl,payload:{
    ownerId:leg.isVault ? intent.ownerId : '',delegatorAddress:leg.isVault ? '' : leg.address,
    validatorAddress:validator,amount:{denom:'ualpha',amount:leg.amount}
  }}))], fee:{amount:[{denom:'ualpha',amount:'0'}],gas:REACTOR_TRANSACTION.GAS},
    reactor:{ownerId:intent.ownerId,guildId:intent.guildId,reactorId:intent.reactorId,validator,
      direction:intent.direction,amount:intent.amount,height:rpc.height,legs,
      ...(collection ? {funding:collection.funding} : {})}};
}
