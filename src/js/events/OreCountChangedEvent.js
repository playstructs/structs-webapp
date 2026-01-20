import {EVENTS} from "../constants/Events";

export class OreCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.ORE_COUNT_CHANGED);
    this.playerType = playerType;
  }
}
