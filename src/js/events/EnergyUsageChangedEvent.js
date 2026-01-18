import {EVENTS} from "../constants/Events";

export class EnergyUsageChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.ENERGY_USAGE_CHANGED);
    this.playerType = playerType;
  }
}
