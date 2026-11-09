import {Player} from "../models/Player";
import {PfpClientRenderAttributes} from "../models/PfpClientRenderAttributes";
import {toBase} from "../util/Units";

/**
 * Exact base units as a canonical decimal string, or null. Strings survive
 * JSON and structuredClone, and are what the exact funds/reactor code expects.
 *
 * @param {...*} candidates first valid integer wins
 * @return {string|null}
 */
function exactString(...candidates) {
  for (const candidate of candidates) {
    const n = toBase(candidate);
    if (n !== null) {
      return n.toString();
    }
  }
  return null;
}

export class PlayerFactory {

  make(obj, meta = null) {
    const player = new Player();
    Object.assign(player, obj);
    player.snapshot_meta = meta;
    player.pfp_client_render_attributes = PfpClientRenderAttributes.fromJson(player.pfp_client_render_attributes);

    // Alpha: the display value and its exact ualpha are owned by the funds
    // snapshot (see PlayerFunds / KeyPlayer.setFunds). Keep the row's alpha_p
    // as the legacy-protocol source.
    player.alpha_p = exactString(obj.alpha_p);

    // Energy: REST grid vals and *_p are already milliwatts. Do not ÷1000.
    // Ore: exponent 0 — grams.
    for (const field of ['load', 'structs_load', 'capacity', 'connection_capacity', 'ore']) {
      player[`${field}_p`] = exactString(obj[`${field}_p`], obj[field]);
    }

    for (const field of ['load', 'structs_load', 'capacity', 'connection_capacity']) {
      const p = player[`${field}_p`];
      player[field] = p !== null ? Number(BigInt(p) / 1000n) : null;
    }
    player.ore = player.ore_p !== null ? Number(player.ore_p) : null;

    return player;
  }
}
