import {EVENTS} from "../constants/Events";

export class StructCountChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.STRUCT_COUNT_CHANGED);
    this.playerType = playerType;
  }
}
