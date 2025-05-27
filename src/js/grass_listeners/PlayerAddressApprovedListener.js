import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class PlayerAddressApprovedListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PlayerAddressPending} playerAddressPending
   */
  constructor(
    gameState,
    guildAPI,
    playerAddressPending
  ) {
    super('PLAYER_ADDRESS_APPROVED');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.playerAddressPending = playerAddressPending;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`
      && messageData.status === 'approved'
      && messageData.address === this.playerAddressPending.address
    ) {
      this.shouldUnregister = () => true;

      // Refresh device count cache
      this.guildAPI.getPlayerAddressCount(this.gameState.thisPlayerId, true).then();

      MenuPage.router.goto('Account', 'deviceActivationComplete');
    }
  }
}