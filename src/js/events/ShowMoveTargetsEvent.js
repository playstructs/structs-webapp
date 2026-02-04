import {EVENTS} from "../constants/Events";

export class ShowMoveTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.SHOW_MOVE_TARGETS);
    this.mapId = mapId;
  }
}
