import {Planet} from "../models/Planet";

export class PlanetFactory {
  make(obj) {
    const planet = new Planet();
    Object.assign(planet, obj);
    return planet;
  }
}