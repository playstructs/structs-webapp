import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class PlayerAddressRevokedListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_ADDRESS_REVOKED');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`
      && messageData.status === 'revoked'
      && messageData.address === this.gameState.signingAccount.address
    ) {
      this.shouldUnregister = () => true;

      MenuPage.router.goto('Auth', 'logout');
    }
  }
}