export class PlayerSearchResultDTO {
  constructor() {
    this.id = null;
    this.address = null;
    this.primary_address = null;
    this.username = null;
    this.pfp = null;
    this.pfp_client_render_attributes = null;
    this.guild_name = null;
    this.tag = null;
    this.fleet_status = null;
    this.alpha = null;
    /** @type {bigint|null} ualpha */
    this.alpha_p = null;
    this.undiscovered_ore = null;
    /** @type {bigint|null} grams */
    this.undiscovered_ore_p = null;
    this.ore = null;
    /** @type {bigint|null} grams */
    this.ore_p = null;
    this.planet_id = null;
    this.under_attack = null;
  }
}
