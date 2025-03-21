import {GuildAPIError} from "../errors/GuildAPIError";

export class GuildManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  async getThisGuild() {
    const response = await this.guildAPI.getThisGuild();
    if (response.success) {
      this.gameState.thisGuild = response.data;
    } else {
      console.log(response.errors);
      throw new GuildAPIError(`Could not get operating guild's info.`);
    }
  }

}