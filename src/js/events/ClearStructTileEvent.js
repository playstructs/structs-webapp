import {EVENTS} from "../constants/Events";

export class ClearStructTileEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(mapId, tileType, ambit, slot, playerId) {
    super(EVENTS.CLEAR_STRUCT_TILE);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}

