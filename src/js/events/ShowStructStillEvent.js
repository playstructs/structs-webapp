import {EVENTS} from "../constants/Events";

export class ShowStructStillEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string} structId
   */
  constructor(mapId, structId) {
    super(EVENTS.SHOW_STRUCT_STILL);
    this.mapId = mapId;
    this.structId = structId;
  }
}
