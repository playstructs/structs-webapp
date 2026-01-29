import {EVENTS} from "../constants/Events";

export class RenderDeploymentIndicatorEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(mapId, tileType, ambit, slot, playerId) {
    super(EVENTS.RENDER_DEPLOYMENT_INDICATOR);
    this.mapId = mapId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}

