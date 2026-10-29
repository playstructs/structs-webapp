import {CHAIN} from "../constants/ChainConstants";
import {exactQueryHeight, validateSigningSnapshot} from "./ChainProtocol";

/** Existing whole-Alpha control: bound exact funds before converting to Number. */
export function transferLimit(player, ownerId, observedHeight) {
  if (player?.id !== ownerId) throw new Error('Transfer player changed');
  const meta = player.snapshot_meta;
  const tip = exactQueryHeight(meta?.observed_tip);
  const observed = observedHeight ? exactQueryHeight(observedHeight) : tip;
  const height = BigInt(tip) > BigInt(observed) ? tip : observed;
  const context = validateSigningSnapshot(meta, {chainId: CHAIN.ID, height}, ['inventory']);
  let whole;
  if (context.protocol === CHAIN.PROTOCOL) {
    const funds = player.spendable_alpha_p;
    if (player.funds_meta?.ready !== true || player.funds_meta.height !== meta.height
        || typeof funds !== 'string' || !/^(0|[1-9][0-9]{0,77})$/.test(funds)
        || BigInt(funds) >= (1n << 256n)) throw new Error('Vault spendability is unavailable');
    whole = BigInt(funds) / 1000000n;
  } else {
    // Preserve the legacy display balance only before the activation height.
    const alpha = Number.isSafeInteger(player.alpha) ? String(player.alpha) : player.alpha;
    if (typeof alpha !== 'string' || alpha.length > 100 || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(alpha)) {
      throw new Error('Legacy Alpha balance is unavailable');
    }
    whole = BigInt(alpha.split('.')[0]);
  }
  return Number(whole > 99n ? 99n : whole);
}
