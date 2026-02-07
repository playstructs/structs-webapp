import {EVENTS} from "../constants/Events";

export class ClearAttackTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.CLEAR_ATTACK_TARGETS);
    this.mapId = mapId;
  }
}
