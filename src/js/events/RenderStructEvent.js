import {EVENTS} from "../constants/Events";
import {Struct} from "../models/Struct";

export class RenderStructEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {Struct} struct
   * @param {AnimationEvent} animationToAutoplay
   */
  constructor(mapId, struct, animationToAutoplay = null) {
    super(EVENTS.RENDER_STRUCT);
    this.mapId = mapId;
    this.struct = struct;
    this.animationToAutoplay = animationToAutoplay;
  }
}

