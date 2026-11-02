import {availableAlpha} from "./AvailableAlpha";
import {CHAIN} from "../constants/ChainConstants";
import {maxQueryHeight, validateSigningSnapshot} from "./ChainProtocol";
import {transferAddress} from "./TransferIntent";
import {isObjectId} from "./ExactInteger";

/** A display snapshot is exact, but never substitutes for native spend preflight. */
export function playerFunds(player, observedHeight = null) {
  const meta = player?.snapshot_meta;
  const observed = maxQueryHeight(meta?.observed_tip, observedHeight || meta?.observed_tip);
  const signing = validateSigningSnapshot(meta,{chainId:CHAIN.ID,height:observed},['inventory']);
  if (!isObjectId(player?.id,1)) throw new Error('Invalid funds owner');
  let alpha;
  if (signing.protocol === CHAIN.PROTOCOL) {
    if (player.funds_meta?.ready !== true || player.funds_meta.height !== meta.height
        || typeof player.funds_meta.provisioned !== 'boolean') throw new Error('Vault funds unavailable');
    transferAddress(player.vault_address);
    alpha = (availableAlpha(player)/1000000n).toString();
  } else {
    // Legacy inventory returns decimal display units. Floor the text itself,
    // preserving exact large values instead of converting through Number.
    if (typeof player.alpha === 'number' && !Number.isSafeInteger(player.alpha)) throw new Error('Legacy Alpha is not exact');
    const value = String(player.alpha);
    if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw new Error('Legacy Alpha unavailable');
    alpha = value.split('.')[0];
  }
  return Object.freeze({ownerId:player.id,height:meta.height,protocol:signing.protocol,
    alpha,vault_address:player.vault_address ?? null,spendable_alpha_p:player.spendable_alpha_p ?? null,
    available_alpha_p:player.available_alpha_p,
    retained_alpha_p:player.retained_alpha_p,
    retained_sources:player.retained_sources ? structuredClone(player.retained_sources) : undefined,
    retained_funds_meta:player.retained_funds_meta ? structuredClone(player.retained_funds_meta) : undefined,
    funds_meta:player.funds_meta ? structuredClone(player.funds_meta) : null,
    snapshot_meta:structuredClone(meta)});
}
