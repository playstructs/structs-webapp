import {EVENTS} from "../constants/Events";

export class ClearStructTileEvent extends CustomEvent {
  /**
   * @param {string} containerId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(containerId, tileType, ambit, slot, playerId) {
    super(EVENTS.CLEAR_STRUCT_TILE);
    this.containerId = containerId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}

