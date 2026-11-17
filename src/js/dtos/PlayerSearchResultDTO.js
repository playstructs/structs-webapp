export class PlayerSearchResultDTO {
  constructor() {
    this.id = null;
    this.address = null;
    this.username = null;
    this.pfp = null;
    this.pfp_client_render_attributes = null;
    this.guild_name = null;
    this.tag = null;
    this.fleet_status = null;
    this.alpha = null;
    this.undiscovered_ore = null;
    this.ore = null;
    this.planet_id = null;
    this.under_attack = null;
    /** Sector Blitz: points a successful raid would earn now, when searching with a contest. */
    this.influence_points = null;
  }
}