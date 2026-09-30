import {Player} from "../models/Player";
import {PfpClientRenderAttributes} from "../models/PfpClientRenderAttributes";
import {legacyToBase, toBase} from "../util/Units";

export class PlayerFactory {

  make(obj) {
    const player = new Player();
    Object.assign(player, obj);
    player.pfp_client_render_attributes = PfpClientRenderAttributes.fromJson(player.pfp_client_render_attributes);

    // Alpha: prefer alpha_p (ualpha); legacy alpha is floored grams.
    player.alpha_p = toBase(obj.alpha_p) ?? legacyToBase(obj.alpha, 6);
    if (player.alpha_p != null) {
      player.alpha = Number(player.alpha_p / 1000000n);
    }

    // Energy: REST grid vals and *_p are already milliwatts. Do not ÷1000.
    // (If only a display-watt field existed, legacyToBase(x, 3) would apply.)
    player.load_p = toBase(obj.load_p) ?? toBase(obj.load);
    player.structs_load_p = toBase(obj.structs_load_p) ?? toBase(obj.structs_load);
    player.capacity_p = toBase(obj.capacity_p) ?? toBase(obj.capacity);
    player.connection_capacity_p = toBase(obj.connection_capacity_p) ?? toBase(obj.connection_capacity);

    player.load = player.load_p != null ? Number(player.load_p / 1000n) : null;
    player.structs_load = player.structs_load_p != null ? Number(player.structs_load_p / 1000n) : null;
    player.capacity = player.capacity_p != null ? Number(player.capacity_p / 1000n) : null;
    player.connection_capacity = player.connection_capacity_p != null
      ? Number(player.connection_capacity_p / 1000n)
      : null;

    // Ore: exponent 0 — value and value_p are identical grams.
    player.ore_p = toBase(obj.ore_p) ?? toBase(obj.ore);
    player.ore = player.ore_p != null ? Number(player.ore_p) : null;

    return player;
  }
}
