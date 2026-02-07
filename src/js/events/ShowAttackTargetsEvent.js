import {EVENTS} from "../constants/Events";

export class ShowAttackTargetsEvent extends CustomEvent {
  /**
   * @param {string} mapId
   * @param {string[]} weaponAmbitsArray - Valid ambits for the weapon (e.g. ["space", "air"])
   */
  constructor(mapId, weaponAmbitsArray) {
    super(EVENTS.SHOW_ATTACK_TARGETS);
    this.mapId = mapId;
    this.weaponAmbitsArray = weaponAmbitsArray;
  }
}
