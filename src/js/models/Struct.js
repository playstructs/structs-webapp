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

    /** @type {number|null} */
    this.status = null;
  }

  /**
   * @return {boolean}
   */
  isMaterialized() {
    return (this.status & 1) > 0;
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return (this.status & 2) > 0;
  }

  /**
   * @return {boolean}
   */
  isOnline() {
    return (this.status & 4) > 0;
  }

  /**
   * @return {boolean}
   */
  isStored() {
    return (this.status & 8) > 0;
  }

  /**
   * @return {boolean}
   */
  isHidden() {
    return (this.status & 16) > 0;
  }

  /**
   * @return {boolean}
   */
  isDestroyed() {
    return (this.status & 32) > 0;
  }

  /**
   * @return {boolean}
   */
  isLocked() {
    return (this.status & 64) > 0;
  }
}

