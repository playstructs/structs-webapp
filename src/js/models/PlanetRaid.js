import {RAID_STATUS} from "../constants/RaidStatus";

export class PlanetRaid {
  constructor() {
    this.planet_id = null;
    this.planet_owner = null;
    this.fleet_id = null;
    this.fleet_owner = null;
    this.status = null;
    this.updated_at = null;
  }

  isRaidActive() {
    return (
        this.status === RAID_STATUS.INITIATED
        || this.status === RAID_STATUS.ONGOING
    );
  }
}