import {EVENTS} from "../constants/Events";

export class UpdateTileStructIdEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  constructor(mapId, tileType, ambit, slot, playerId, structId) {
    super(EVENTS.UPDATE_TILE_STRUCT_ID);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structId = structId;
  }
}

