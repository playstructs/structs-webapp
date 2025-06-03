import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class PlayerAddressRevokedListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} addressToWatch
   */
  constructor(
    gameState,
    guildAPI,
    addressToWatch
  ) {
    super('PLAYER_ADDRESS_REVOKED');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.addressToWatch = addressToWatch;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`
      && messageData.status === 'revoked'
      && messageData.address === this.addressToWatch
    ) {
      this.shouldUnregister = () => true;

      if (this.gameState.signingAccount.address === this.addressToWatch) {
        MenuPage.router.goto('Auth', 'logout');
      } else {
        this.guildAPI.getPlayerAddressCount(this.gameState.thisPlayerId, true).then(() => {
          MenuPage.router.goto('Account', 'devices');
        });
      }
    }
  }
}