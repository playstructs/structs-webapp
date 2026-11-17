export class RaidSearchRequestDTO {
  constructor() {
    this.search_string = null;
    this.guild_id = null;
    this.min_ore = 0;
    this.fleet_away_only = 0;
    this.not_under_attack = 0;
    /** Sector Blitz: exclude the searcher's own guild. */
    this.rival_guilds_only = 0;
    /** Sector Blitz: only planets the searcher's guild hasn't won in the contest. */
    this.undefeated = 0;
    /** Sector Blitz: the contest to score results against; adds influence_points to each result. */
    this.contest_id = null;
    /** Sector Blitz: only planets in this sector (chosen on the Sector Map, not shown in the form). */
    this.sector = null;
    this.page = 1;
  }
}
