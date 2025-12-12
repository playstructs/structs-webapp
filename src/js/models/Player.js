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
    this.guild_name = null;
    this.tag = null;
    this.alpha = null;
    this.ore = null;
    this.load = null;
    this.structs_load = null;
    this.capacity = null;
    this.connection_capacity = null;
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
}