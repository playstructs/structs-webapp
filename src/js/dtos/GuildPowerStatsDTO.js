export class GuildPowerStatsDTO {
  constructor() {
    this.total_fuel = null;
    /** @type {bigint|null} ualpha */
    this.total_fuel_p = null;
    this.total_load = null;
    /** @type {bigint|null} milliwatts */
    this.total_load_p = null;
    this.total_capacity = null;
    /** @type {bigint|null} milliwatts */
    this.total_capacity_p = null;
    this.avg_connection_capacity = null;
    /** @type {bigint|null} milliwatts (rounded from fractional average) */
    this.avg_connection_capacity_p = null;
  }
}
