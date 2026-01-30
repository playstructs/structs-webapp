import {EVENTS} from "../constants/Events";
import {Struct} from "../models/Struct";

export class RenderStructEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct
   */
  constructor(mapId, struct) {
    super(EVENTS.RENDER_STRUCT);
    this.mapId = mapId;
    this.struct = struct;
  }
}

