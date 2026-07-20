import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class RecoverAccountAddressApprovedListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {AuthManager} authManager
   * @param {string} playerId
   * @param {string} address
   * @param {string} mnemonic
   */
  constructor(
    gameState,
    authManager,
    playerId,
    address,
    mnemonic
  ) {
    super('RECOVER_ACCOUNT_ADDRESS_APPROVED');
    this.gameState = gameState;
    this.authManager = authManager;
    this.playerId = playerId;
    this.address = address;
    this.mnemonic = mnemonic;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.playerId}`
      && messageData.status === 'approved'
      && messageData.address === this.address
    ) {
      this.shouldUnregister = () => true;

      this.authManager.completeMnemonicLogin(this.playerId, this.mnemonic).then((success) => {
        if (success) {
          MenuPage.router.goto('Auth', 'loginRecoverAccountSuccess');
        } else {
          MenuPage.router.goto('Auth', 'loginRecoverAccountFail');
        }
      }).catch((error) => {
        console.log(error);
        MenuPage.router.goto('Auth', 'loginRecoverAccountFail');
      });
    }
  }
}
