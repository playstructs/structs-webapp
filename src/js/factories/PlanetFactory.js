import {Planet} from "../models/Planet";

export class PlanetFactory {
  make(obj) {
    const planet = new Planet();
    Object.assign(planet, obj);
    planet.undiscovered_ore = parseInt(planet.undiscovered_ore);
    return planet;
  }
}