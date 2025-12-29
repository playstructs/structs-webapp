import {EVENTS} from "../constants/Events";

export class RenderStructEvent extends CustomEvent {
  /**
   * @param {string} containerId
   * @param {Struct} struct
   */
  constructor(containerId, struct) {
    super(EVENTS.RENDER_STRUCT);
    this.containerId = containerId;
    this.struct = struct;
  }
}

