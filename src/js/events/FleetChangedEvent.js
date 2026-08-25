import {EVENTS} from "../constants/Events";

export class FleetChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.FLEET_CHANGED);
    this.playerType = playerType;
  }
}
