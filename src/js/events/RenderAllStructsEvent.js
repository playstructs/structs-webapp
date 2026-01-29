import {EVENTS} from "../constants/Events";

export class RenderAllStructsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.RENDER_ALL_STRUCTS);
    this.mapId = mapId;
  }
}

