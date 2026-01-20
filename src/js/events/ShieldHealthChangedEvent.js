import {EVENTS} from "../constants/Events";

export class ShieldHealthChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.SHIELD_HEALTH_CHANGED);
    this.playerType = playerType;
  }
}
