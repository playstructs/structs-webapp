export class PlayerAddress {
  constructor() {
    this.address = null;
    this.player_id = null;
    this.guild_id = null;
    this.status = null;

    this.ip = null;
    this.user_agent = null;

    this.block_time = null;

    this.permissions = null;

    this.alpha = null;

    this.isOnlyManagingDevice = false;

    // Which page started a logout of this device (see LOGOUT_FROM); picks the warnings' wording.
    this.logoutFrom = null;
  }
}