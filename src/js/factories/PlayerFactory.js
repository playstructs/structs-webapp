import {Player} from "../models/Player";
import {PRECISION_CONVERSION} from "../constants/PrecisionConstants";

export class PlayerFactory {

  /**
   * @param {string} numberString
   * @return {number}
   */
  convertFromPreciseNumber(numberString) {
    return Number(BigInt(numberString) / BigInt(PRECISION_CONVERSION.ENERGY));
  }

  make(obj) {
    const player = new Player();
    Object.assign(player, obj);
    player.load = this.convertFromPreciseNumber(player.load);
    player.structs_load = this.convertFromPreciseNumber(player.structs_load);
    player.capacity = this.convertFromPreciseNumber(player.capacity);
    player.connection_capacity = this.convertFromPreciseNumber(player.connection_capacity);
    player.ore = parseInt(player.ore);
    return player;
  }
}