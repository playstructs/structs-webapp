import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {PERMISSIONS} from "../constants/Permissions";
import {exactAlphaAmount} from "../util/ReactorIntent";
import {retainedAlphaSources} from "../util/AvailableAlpha";

async function spendable(bank, address) {
  const coin = (await bank.SpendableBalanceByDenom({address, denom:'ualpha'})).balance;
  if (coin?.denom !== 'ualpha') throw new Error('Native Alpha spendability is unavailable');
  return exactAlphaAmount(coin.amount);
}

/** Read one pinned snapshot. Prefer vault funds and inspect retained funds only if needed. */
export async function readVaultFunding(rpc, ownerId, vaultAddress, actor, player, needed = null) {
  const bank = new BankQuery(rpc);
  const query = new StructsQuery(rpc);
  const vault = await spendable(bank, vaultAddress);
  const result = {vault, total:vault, sources:[]};
  if (needed !== null && vault >= needed) return result;
  if (actor.playerId !== ownerId || (BigInt(actor.permissions) & BigInt(PERMISSIONS.TOKEN_TRANSFER)) === 0n) {
    return result;
  }
  for (const candidate of retainedAlphaSources(player)) {
    const owner = await query.Address({address:candidate.address});
    if (owner.address !== candidate.address) throw new Error('Retained Alpha address lookup changed');
    if (owner.playerId !== ownerId) continue;
    const amount = await spendable(bank, candidate.address);
    if (amount > 0n) {
      result.sources.push({address:candidate.address, amount});
      result.total += amount;
    }
    if (needed !== null && result.total >= needed) break;
  }
  return result;
}

/** Collect only the shortfall, in the same transaction as the requested spend. */
export function collectVaultFunding(funds, vaultAddress, requested) {
  let remaining = requested > funds.vault ? requested - funds.vault : 0n;
  const sources = [];
  for (const source of funds.sources) {
    if (remaining === 0n) break;
    const amount = source.amount < remaining ? source.amount : remaining;
    sources.push({address:source.address, amount:amount.toString()});
    remaining -= amount;
  }
  if (remaining !== 0n) throw new Error('Insufficient eligible Alpha for the requested spend');
  return {
    funding:{vaultAddress, vaultBalance:funds.vault.toString(), sources},
    messages:sources.map(source => ({typeUrl:'/structs.structs.MsgPlayerSend', payload:{
      fromAddress:source.address, toAddress:vaultAddress, amount:[{denom:'ualpha', amount:source.amount}]
    }})),
  };
}
