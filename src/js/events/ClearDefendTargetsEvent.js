import {EVENTS} from "../constants/Events";

export class ClearDefendTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.CLEAR_DEFEND_TARGETS);
    this.mapId = mapId;
  }
}
