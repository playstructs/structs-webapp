import {EVENTS} from "../constants/Events";

export class PlanetRaidStatusChangedEvent extends CustomEvent {

  /**
   * @param {string} playerType
   */
  constructor(playerType) {
    super(EVENTS.PLANET_RAID_STATUS_CHANGED);
    this.playerType = playerType;
  }
}
