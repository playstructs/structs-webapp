import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";

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
    return (this.status & STRUCT_STATUS_FLAGS.MATERIALIZED) > 0;
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return (this.status & STRUCT_STATUS_FLAGS.BUILT) > 0;
  }

  /**
   * @return {boolean}
   */
  isOnline() {
    return (this.status & STRUCT_STATUS_FLAGS.ONLINE) > 0;
  }

  /**
   * @return {boolean}
   */
  isStored() {
    return (this.status & STRUCT_STATUS_FLAGS.STORED) > 0;
  }

  /**
   * @return {boolean}
   */
  isHidden() {
    return (this.status & STRUCT_STATUS_FLAGS.HIDDEN) > 0;
  }

  /**
   * @return {boolean}
   */
  isDestroyed() {
    return (this.status & STRUCT_STATUS_FLAGS.DESTROYED) > 0;
  }

  /**
   * @return {boolean}
   */
  isLocked() {
    return (this.status & STRUCT_STATUS_FLAGS.LOCKED) > 0;
  }

  /**
   * @param {number} flag see STRUCT_STATUS_FLAGS
   */
  addStatusFlag(flag) {
    this.status |= flag;
  }

  /**
   * @param {number} flag see STRUCT_STATUS_FLAGS
   */
  removeStatusFlag(flag) {
    this.status &= ~flag;
  }
}

