export class Infusion {
  constructor() {
    this.destination_id = null;
    this.address = null;
    this.destination_type = null;
    this.player_id = null;
    this.fuel = null;
    /** @type {string|null} exact decimal, ualpha */
    this.fuel_p = null;
    this.defusing = null;
    /** @type {string|null} exact decimal, ualpha */
    this.defusing_p = null;
    this.power = null;
    /** @type {string|null} exact decimal, milliwatts */
    this.power_p = null;
    this.ratio = null;
    /** @type {string|null} exact decimal */
    this.ratio_p = null;
    /** @type {string|null} raw 0–1 decimal string */
    this.commission = null;
    this.created_at = null;
    this.updated_at = null;
    this.join_infusion_minimum = null;
    /** @type {string|null} exact decimal, ualpha */
    this.join_infusion_minimum_p = null;
    /** @type {number|string|null} */
    this.defusion_end_height = null;
    /** @type {string|null} exact decimal, milliwatts */
    this.owner_power_p = null;
    this.positions = [];
    this.positions_meta = null;
    this.snapshot_meta = null;
  }
}
