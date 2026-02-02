import {EVENTS} from "../constants/Events";

export class ClearMoveTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.CLEAR_MOVE_TARGETS);
    this.mapId = mapId;
  }
}
