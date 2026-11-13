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

  /**
   * @return {boolean}
   */
  /**
   * @return {number} Energy drawn by the player and their Structs
   */
  getTotalLoad() {
    return (this.load ?? 0) + (this.structs_load ?? 0);
  }

  /**
   * @return {number} Energy available from the player's own and connected capacity
   */
  getTotalCapacity() {
    return (this.capacity ?? 0) + (this.connection_capacity ?? 0);
  }

  isOverloaded() {
    return this.getTotalLoad() > this.getTotalCapacity();
  }
}