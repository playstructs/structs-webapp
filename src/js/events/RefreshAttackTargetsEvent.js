import {EVENTS} from "../constants/Events";

export class RefreshAttackTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   */
  constructor(mapId) {
    super(EVENTS.REFRESH_ATTACK_TARGETS);
    this.mapId = mapId;
  }
}
