import {legacyToBase, toBase} from "../util/Units";

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
    /** @type {string|null} exact decimal, ualpha */
    this.alpha_p = null;
    this.ore = null;
    /** @type {string|null} exact decimal, grams */
    this.ore_p = null;
    this.load = null;
    /** @type {string|null} exact decimal, milliwatts */
    this.load_p = null;
    this.structs_load = null;
    /** @type {string|null} exact decimal, milliwatts */
    this.structs_load_p = null;
    this.capacity = null;
    /** @type {string|null} exact decimal, milliwatts */
    this.capacity_p = null;
    this.connection_capacity = null;
    /** @type {string|null} exact decimal, milliwatts */
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
   * Total load and capacity in exact milliwatts. Works on Player instances and
   * on plain player rows; prefers *_p fields (mW) over legacy watt fields.
   *
   * @param {object|null} player
   * @return {{load: bigint, capacity: bigint}}
   */
  static energyMilliwatts(player) {
    const mw = (field) => toBase(player?.[`${field}_p`]) ?? legacyToBase(player?.[field], 3) ?? 0n;
    return {
      load: mw('load') + mw('structs_load'),
      capacity: mw('capacity') + mw('connection_capacity'),
    };
  }

  /**
   * @return {boolean}
   */
  isOverloaded() {
    const {load, capacity} = Player.energyMilliwatts(this);
    return load > capacity;
  }
}
