import {EVENTS} from "../constants/Events";

export class RefreshActionBarEvent extends CustomEvent {
  /**
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {string} structId
   */
  constructor(tileType, ambit, slot, playerId, structId) {
    super(EVENTS.REFRESH_ACTION_BAR);
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structId = structId;
  }
}

