import {exactAlphaAmount} from "./ReactorIntent";
import {transferAddress} from "./TransferIntent";

export const MAX_ALPHA_SOURCES = 16;

/** Indexed candidates are hints; every spend rechecks native ownership and funds. */
export function retainedAlphaSources(player) {
  const meta = player.retained_funds_meta;
  if (!meta || meta.ready !== true) return [];
  if (meta.height !== player.snapshot_meta?.height || meta.source_limit !== MAX_ALPHA_SOURCES
      || !Array.isArray(player.retained_sources) || player.retained_sources.length > MAX_ALPHA_SOURCES) {
    throw new Error('Retained Alpha coverage is invalid');
  }
  const seen = new Set();
  const sources = player.retained_sources.map(row => {
    const address = transferAddress(row.address);
    const amount = exactAlphaAmount(row.spendable_alpha_p);
    if (address === player.vault_address || seen.has(address) || amount === 0n) {
      throw new Error('Retained Alpha source is invalid');
    }
    seen.add(address);
    return {address, amount};
  });
  if (sources.reduce((sum, row) => sum + row.amount, 0n) !== exactAlphaAmount(player.retained_alpha_p)) {
    throw new Error('Retained Alpha total does not match its sources');
  }
  return sources.sort((a, b) => a.address < b.address ? -1 : a.address > b.address ? 1 : 0);
}

/** Known spendable funds, distinct from total wealth, bonded stake and cooldown. */
export function availableAlpha(player) {
  const vault = exactAlphaAmount(player.spendable_alpha_p);
  const retained = retainedAlphaSources(player).reduce((sum, row) => sum + row.amount, 0n);
  const total = vault + retained;
  if (player.available_alpha_p !== undefined && exactAlphaAmount(player.available_alpha_p) !== total) {
    throw new Error('Available Alpha total does not match its sources');
  }
  return total;
}
