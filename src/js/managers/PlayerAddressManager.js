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

  addPlayerAddressMeta() {
    const request = new AddPlayerAddressMetaRequestDTO();
    request.address = this.gameState.signingAccount.address;
    request.guild_id = this.gameState.thisGuild.id;
    request.user_agent = window.navigator.userAgent;

    this.guildAPI.addPlayerAddressMeta(request).then(response => {
      if (!response.success) {
        console.log(response);
      }
    });
  }
}