import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class ActivatingDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {AuthManager} authManager
   * @param {ActivationCodeInfoDTO} activationCodeInfo
   */
  constructor(
    gameState,
    authManager,
    activationCodeInfo
  ) {
    super();
    this.gameState = gameState;
    this.authManager = authManager;
    this.activationCodeInfo = activationCodeInfo;
  }

  initPageCode() {
    this.authManager.login().then(async function (success) {
      if (!success) {
        MenuPage.router.goto('Auth', 'loginActivateDeviceCancelled');
        return;
      }

      this.gameState.setThisPlayerId(this.activationCodeInfo.player_id);

      const player = await this.guildAPI.getPlayer(this.activationCodeInfo.player_id);
      this.gameState.setThisPlayer(player);

      const height = await this.guildAPI.getPlayerLastActionBlockHeight(this.activationCodeInfo.player_id);
      this.gameState.setLastActionBlockHeight(height);

      MenuPage.router.goto('Auth', 'loginActivateDeviceComplete');
    }.bind(this)).catch(() => {
      MenuPage.router.goto('Auth', 'loginActivateDeviceCancelled');
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device');

    MenuPage.setPageTemplateContent(`
      <div class="login-activating-device-layout">
        <img src="/img/loading-3-dots.gif" class="loading-3-dots"  alt="3 dots loading animation"/>
        <div>
          Activating device<br>
          <br>
          <span class="sui-text-warning">Do not close this screen.</span>
        </div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
