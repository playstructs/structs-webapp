import {PlanetRaid} from "../models/PlanetRaid";

export class PlanetRaidFactory {
  make(obj) {
    const planetRaid = new PlanetRaid();
    Object.assign(planetRaid, obj);
    return planetRaid;
  }
}