import {EVENTS} from "../constants/Events";

export class RenderAllStructsEvent extends CustomEvent {
  /**
   * @param {string} containerId
   */
  constructor(containerId) {
    super(EVENTS.RENDER_ALL_STRUCTS);
    this.containerId = containerId;
  }
}

