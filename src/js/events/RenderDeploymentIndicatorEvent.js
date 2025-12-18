import {EVENTS} from "../constants/Events";

export class RenderDeploymentIndicatorEvent extends CustomEvent {
  /**
   * @param {string} containerId
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  constructor(containerId, tileType, ambit, slot, playerId) {
    super(EVENTS.RENDER_DEPLOYMENT_INDICATOR);
    this.containerId = containerId;
    this.tileType = tileType;
    this.ambit = ambit;
    this.slot = slot;
    this.playerId = playerId;
  }
}

