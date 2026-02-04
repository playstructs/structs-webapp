import {EVENTS} from "../constants/Events";

export class ShowDefendTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.SHOW_DEFEND_TARGETS);
    this.mapId = mapId;
  }
}
