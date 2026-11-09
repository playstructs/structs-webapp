export class GuildSearchResultDTO {
  constructor() {
    this.guild_id = null;
    this.name = null;
    this.logo = null;
    this.alpha = null;
    /** @type {string|null} exact decimal ualpha (reactor fuel aggregate) */
    this.alpha_p = null;
    this.members = null;
  }
}
