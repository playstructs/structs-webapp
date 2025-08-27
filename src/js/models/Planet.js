import {AMBITS} from "../constants/Ambits";

export class Planet {
  constructor() {
    this.id = null;
    this.owner = null;
    this.map = null;
    this.space_slots = null;
    this.air_slots = null;
    this.land_slots = null;
    this.water_slots = null;
    this.name = null;
    this.undiscovered_ore = null;

    // TODO: Temporary, for map testing until ornament system chain side is built
    this.ornaments = new Map([
      [AMBITS.SPACE, []],
      [AMBITS.AIR, []],
      [AMBITS.LAND, []],
      [AMBITS.WATER, []]
    ]);
  }

  /**
   * Get a list of the planet's available ambits.
   *
   * @return {string[]}
   */
  getAmbits() {
    const ambits = [];
    if (this.space_slots && this.space_slots > 0) {
      ambits.push(AMBITS.SPACE);
    }
    if (this.air_slots && this.air_slots > 0) {
      ambits.push(AMBITS.AIR);
    }
    if (this.land_slots && this.land_slots > 0) {
      ambits.push(AMBITS.LAND);
    }
    if (this.water_slots && this.water_slots > 0) {
      ambits.push(AMBITS.WATER);
    }
    return ambits;
  }

  /**
   * Get a map of ambits to ambit map ornaments.
   *
   * @return {Map<string, []>}
   */
  getOrnaments() {
    return this.ornaments;
  }
}