import {AddPlayerAddressMetaRequestDTO} from "../dtos/AddPlayerAddressMetaRequestDTO";

export class PlayerAddressManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  async addPlayerAddressMeta() {
    const request = new AddPlayerAddressMetaRequestDTO();
    request.address = this.gameState.signingAccount.address;
    request.guild_id = this.gameState.thisGuild.id;
    request.user_agent = window.navigator.userAgent;

    const response = await this.guildAPI.addPlayerAddressMeta(request);

    if (!response.success) {
      console.log(response);
    }
  }
}