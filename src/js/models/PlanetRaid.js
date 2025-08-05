import {RAID_STATUS} from "../constants/RaidStatus";

export class PlanetRaid {
  constructor() {
    this.id = null;
    this.fleet_id = null;
    this.fleet_owner = null;
    this.planet_id = null;
    this.planet_owner = null;
    this.status = null;
    this.created_at = null;
  }

  isRaidActive() {
    return (
      this.id
      && (
        this.status === RAID_STATUS.INITIATED
        || this.status === RAID_STATUS.ONGOING
      )
    );
  }
}