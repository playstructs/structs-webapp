import {EVENTS} from "../constants/Events";
import {Struct} from "../models/Struct";

export class RenderStructHUDEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct
   */
  constructor(mapId, struct) {
    super(EVENTS.RENDER_STRUCT_HUD);
    this.mapId = mapId;
    this.struct = struct;
  }
}
