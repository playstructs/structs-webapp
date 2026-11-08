export class GuildPowerStatsDTO {
  constructor() {
    this.total_fuel = null;
    /** @type {string|null} exact decimal ualpha */
    this.total_fuel_p = null;
    this.total_load = null;
    /** @type {string|null} exact decimal milliwatts */
    this.total_load_p = null;
    this.total_capacity = null;
    /** @type {string|null} exact decimal milliwatts */
    this.total_capacity_p = null;
    this.avg_connection_capacity = null;
    /** @type {string|null} exact decimal milliwatts (rounded from fractional average) */
    this.avg_connection_capacity_p = null;
  }
}
