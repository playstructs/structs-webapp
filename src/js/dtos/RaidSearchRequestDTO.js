export class RaidSearchRequestDTO {
  constructor() {
    this.search_string = null;
    this.guild_id = null;
    this.min_ore = 0;
    this.fleet_away_only = 0;
    this.page = 1;
  }
}