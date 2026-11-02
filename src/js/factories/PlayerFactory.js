import {Player} from "../models/Player";
import {PRECISION_CONVERSION} from "../constants/PrecisionConstants";
import {PfpClientRenderAttributes} from "../models/PfpClientRenderAttributes";

export class PlayerFactory {

  /**
   * @param {string} numberString
   * @return {number}
   */
  convertFromPreciseNumber(numberString) {
    return Number(BigInt(numberString) / BigInt(PRECISION_CONVERSION.ENERGY));
  }

  make(obj, meta = null) {
    const player = new Player();
    Object.assign(player, obj);
    player.snapshot_meta = meta;
    // Preserve exact base units before legacy display conversion loses precision.
    for (const field of ['load', 'structs_load', 'capacity', 'connection_capacity', 'ore']) {
      player[`${field}_p`] = obj[field] == null ? null : String(obj[field]);
    }
    player.pfp_client_render_attributes = PfpClientRenderAttributes.fromJson(player.pfp_client_render_attributes);
    player.load = this.convertFromPreciseNumber(player.load);
    player.structs_load = this.convertFromPreciseNumber(player.structs_load);
    player.capacity = this.convertFromPreciseNumber(player.capacity);
    player.connection_capacity = this.convertFromPreciseNumber(player.connection_capacity);
    player.ore = parseInt(player.ore);
    return player;
  }
}