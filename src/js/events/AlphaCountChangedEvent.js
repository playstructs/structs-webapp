import {EVENTS} from "../constants/Events";

export class AlphaCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.ALPHA_COUNT_CHANGED);
    this.playerType = playerType;
  }
}
