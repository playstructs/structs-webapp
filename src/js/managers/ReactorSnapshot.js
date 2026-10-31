import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {QueryClientImpl as StakingQuery} from "cosmjs-types/cosmos/staking/v1beta1/query";
import {BondStatus} from "cosmjs-types/cosmos/staking/v1beta1/staking";
import {CHAIN} from "../constants/ChainConstants";
import {validateSigningSnapshot} from "../util/ChainProtocol";
import {transferAddress} from "../util/TransferIntent";
import {legacyDecimalFromWire} from "../util/MessagePayload";
import {reactorState} from "../util/ReactorState";
import {availableReactorStake, reactorValidatorAddress} from "./ReactorPreparation";
import {readVaultFunding} from "./VaultFunding";
import {isUint64} from "../util/ExactInteger";

/**
 * Read the chain state a reactor preview needs. This is read-only context;
 * submission independently rechecks the chosen intent.
 *
 * @param rpc
 * @param {object} indexed
 * @param {string} ownerId
 * @param {string} guildId
 * @param {string|number} legacyRatio
 * @param {object|null} fundingPlayer
 * @param {string|null} accountAddress
 * @return {Promise<object>} see reactorState()
 */
export async function readReactorSnapshot(
  rpc,
  indexed,
  ownerId,
  guildId,
  legacyRatio,
  fundingPlayer = null,
  accountAddress = null
) {
  const signing = validateSigningSnapshot(indexed.snapshot_meta, {chainId: rpc.chainId, height: rpc.height}, ['inventory']);
  const query = new StructsQuery(rpc);
  const staking = new StakingQuery(rpc);
  const player = (await query.Player({id: ownerId})).Player;
  const guild = (await query.Guild({id: guildId})).Guild;
  if (player?.id !== ownerId || player.guildId !== guildId || guild?.id !== guildId) {
    throw new Error('Guild membership changed');
  }

  const reactor = (await query.Reactor({id: guild.primaryReactorId})).Reactor;
  if (reactor?.id !== guild.primaryReactorId) {
    throw new Error('Guild reactor is unavailable');
  }

  const validatorAddress = reactorValidatorAddress(reactor.validator);
  const validator = (await staking.Validator({validatorAddr: validatorAddress})).validator;
  if (
    validator?.operatorAddress !== validatorAddress
    || typeof validator.jailed !== 'boolean'
    || ![
      BondStatus.BOND_STATUS_UNBONDED,
      BondStatus.BOND_STATUS_UNBONDING,
      BondStatus.BOND_STATUS_BONDED,
    ].includes(validator.status)
  ) {
    throw new Error('Reactor validator health is unavailable');
  }

  const params = (await staking.Params({})).params;
  if (params?.bondDenom !== 'ualpha' || !Number.isInteger(params.maxEntries) || params.maxEntries < 1) {
    throw new Error('Staking parameters unavailable');
  }

  let source = transferAddress(player.primaryAddress);
  if (signing.protocol === CHAIN.PROTOCOL) {
    const vault = await query.Vault({ownerId});
    if (vault.ownerId !== ownerId || typeof vault.provisioned !== 'boolean') {
      throw new Error('Invalid reactor vault');
    }
    source = transferAddress(vault.address);
  }

  let funds;
  if (signing.protocol === CHAIN.PROTOCOL && fundingPlayer !== null) {
    if (fundingPlayer.id !== ownerId) {
      throw new Error('Reactor funding owner changed');
    }
    const actor = await query.Address({address: accountAddress});
    if (
      actor.address !== accountAddress
      || actor.playerId !== ownerId
      || !isUint64(actor.permissions)
    ) {
      throw new Error('Reactor funding authority is unavailable');
    }
    // The indexed list only locates candidates. All spendable values and owners
    // are reread at this reactor snapshot's height, including on a limited key.
    funds = (await readVaultFunding(rpc, ownerId, source, actor, fundingPlayer)).total.toString();
  } else {
    const coin = (await new BankQuery(rpc).SpendableBalanceByDenom({address: source, denom: 'ualpha'})).balance;
    if (coin?.denom !== 'ualpha') {
      throw new Error('Reactor funding is unavailable');
    }
    funds = coin.amount;
  }

  let ratio = 1n;
  let legacyAvailable = null;
  if (signing.protocol !== CHAIN.PROTOCOL) {
    const value = String(legacyRatio);
    if (!isUint64(value) || BigInt(value) % 1000n) {
      throw new Error('Legacy reactor ratio unavailable');
    }
    ratio = BigInt(value) / 1000n;
    legacyAvailable = (await availableReactorStake(staking, source, validatorAddress, params.maxEntries)).toString();
  }
  if (validator.jailed || validator.status !== BondStatus.BOND_STATUS_BONDED) {
    ratio = 0n;
  }

  return reactorState(indexed, {
    ownerId,
    guildId,
    reactorId: reactor.id,
    validator: validatorAddress,
    protocol: signing.protocol,
    height: rpc.height,
    source,
    funds,
    minimum: guild.joinInfusionMinimum,
    commission: legacyDecimalFromWire(reactor.defaultCommission),
    ratio,
    maxEntries: params.maxEntries,
    legacyAvailable,
  });
}
