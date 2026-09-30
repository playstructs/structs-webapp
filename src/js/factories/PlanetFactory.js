import {Planet} from "../models/Planet";
import {toBase} from "../util/Units";

export class PlanetFactory {
  make(obj) {
    const planet = new Planet();
    Object.assign(planet, obj);

    planet.undiscovered_ore_p = toBase(obj.undiscovered_ore_p) ?? toBase(obj.undiscovered_ore);
    planet.undiscovered_ore = planet.undiscovered_ore_p != null
      ? Number(planet.undiscovered_ore_p)
      : null;

    return planet;
  }
}
