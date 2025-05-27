import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountActivatingDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {AuthManager} authManager
   * @param {PlayerAddressPending} playerAddressPending
   */
  constructor(
    gameState,
    authManager,
    playerAddressPending
  ) {
    super();
    this.gameState = gameState;
    this.authManager = authManager;
    this.playerAddressPending = playerAddressPending;
  }

  initPageCode() {
    this.authManager.activateDevice(this.playerAddressPending).then(async function (success) {
      if (!success) {
        MenuPage.router.goto('Account', 'deviceActivationCancelled');
      }
    }).catch(() => {
      MenuPage.router.goto('Account', 'deviceActivationCancelled');
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate New Device');

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
