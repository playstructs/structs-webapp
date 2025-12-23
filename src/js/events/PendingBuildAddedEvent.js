import {EVENTS} from "../constants/Events";

export class PendingBuildAddedEvent extends CustomEvent {
  /**
   * @param {string} containerId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {StructType} structType
   */
  constructor(containerId, tileType, ambit, slot, playerId, structType) {
    super(EVENTS.PENDING_BUILD_ADDED);
    this.containerId = containerId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
    this.structType = structType;
  }
}

