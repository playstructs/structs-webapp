export class Struct {
  constructor() {
    /** @type {string|null} */
    this.id = null;

    /** @type {number|null} */
    this.index = null;

    /** @type {number|null} - FK to struct_type.id */
    this.type = null;

    /** @type {string|null} */
    this.creator = null;

    /** @type {string|null} - Player ID who owns this struct */
    this.owner = null;

    /** @type {string|null} - "fleet" or "planet" */
    this.location_type = null;

    /** @type {string|null} - Fleet ID or Planet ID */
    this.location_id = null;

    /** @type {string|null} - "space", "air", "land", "water" */
    this.operating_ambit = null;

    /** @type {number|null} */
    this.slot = null;

    /** @type {number|null} */
    this.health = null;

    /** @type {boolean} */
    this.is_building = false;
  }
}

