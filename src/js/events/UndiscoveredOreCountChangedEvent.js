import {EVENTS} from "../constants/Events";

export class UndiscoveredOreCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED);
    this.playerType = playerType;
  }
}
