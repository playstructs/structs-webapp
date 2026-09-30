import {legacyToBase} from "../util/Units";

export class Player {
  constructor() {
    this.id = null;
    this.primary_address = null;
    this.guild_id = null;
    this.substation_id = null;
    this.planet_id = null;
    this.fleet_id = null;
    this.username = null;
    this.pfp = null;
    this.pfp_client_render_attributes = null;
    this.guild_name = null;
    this.tag = null;
    this.alpha = null;
    /** @type {bigint|null} ualpha */
    this.alpha_p = null;
    this.ore = null;
    /** @type {bigint|null} grams */
    this.ore_p = null;
    this.load = null;
    /** @type {bigint|null} milliwatts */
    this.load_p = null;
    this.structs_load = null;
    /** @type {bigint|null} milliwatts */
    this.structs_load_p = null;
    this.capacity = null;
    /** @type {bigint|null} milliwatts */
    this.capacity_p = null;
    this.connection_capacity = null;
    /** @type {bigint|null} milliwatts */
    this.connection_capacity_p = null;
  }

  /**
   * @return {string}
   */
  getTag() {
    return (this.tag && this.tag.length > 0) ? `[${this.tag}]` : '';
  }

  /**
   * @return {string}
   */
  getUsername() {
    return (this.username && this.username.length > 0) ? `${this.username}` : 'Name Redacted';
  }

  /**
   * @return {boolean}
   */
  isOverloaded() {
    // Prefer *_p (mW). Legacy load/capacity fields are watts.
    const load = this.load_p ?? legacyToBase(this.load, 3) ?? 0n;
    const structsLoad = this.structs_load_p ?? legacyToBase(this.structs_load, 3) ?? 0n;
    const capacity = this.capacity_p ?? legacyToBase(this.capacity, 3) ?? 0n;
    const connectionCapacity = this.connection_capacity_p
      ?? legacyToBase(this.connection_capacity, 3)
      ?? 0n;

    const totalLoad = load + structsLoad;
    const totalCapacity = capacity + connectionCapacity;

    return totalLoad > totalCapacity;
  }
}
