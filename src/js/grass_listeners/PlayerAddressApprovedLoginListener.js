import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class PlayerAddressApprovedLoginListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {ActivationCodeInfoDTO} activationCodeInfo
   */
  constructor(
    gameState,
    activationCodeInfo
  ) {
    super('PLAYER_ADDRESS_APPROVED_LOGIN');
    this.gameState = gameState;
    this.activationCodeInfo = activationCodeInfo;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.activationCodeInfo.player_id}`
      && messageData.status === 'approved'
      && messageData.address === this.gameState.signingAccount.address
    ) {
      this.shouldUnregister = () => true;

      MenuPage.router.goto('Auth', 'loginActivatingDevice', this.activationCodeInfo);
    }
  }
}