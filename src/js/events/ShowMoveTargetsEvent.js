import {EVENTS} from "../constants/Events";

export class ShowMoveTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct - The struct that is being moved
   */
  constructor(mapId, struct) {
    super(EVENTS.SHOW_MOVE_TARGETS);
    this.mapId = mapId;
    this.struct = struct;
  }
}
