import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class RecoverAccountFailViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.tryAgainBtnId = 'try-again-btn';
    this.logInFromAnotherDeviceBtnId = 'log-in-from-another-device-btn';
  }

  initPageCode() {
    document.getElementById(this.tryAgainBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'loginRecoverAccountStart');
    });
    document.getElementById(this.logInFromAnotherDeviceBtnId).addEventListener('click', () => {
      console.log('Log in with recovery key');
      MenuPage.router.goto('Auth', 'loginActivateDevice');
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Recover Account');

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="device-activation-cancelled-text-container">
          <div class="sui-text-destructive">
            <i class="sui-icon sui-icon-md icon-alert"></i>
            Invalid Recovery Key
          </div>
          <div>The Recovery Key provided did not match any known account. Please ensure each word is spelled correctly and is entered in the correct order.</div>
        </div>        
        
        <div class="device-activation-btn-container">
          <button id="${this.tryAgainBtnId}" class="sui-screen-btn sui-mod-primary">Try Again</button>
          <button id="${this.logInFromAnotherDeviceBtnId}" class="sui-screen-btn sui-mod-secondary">
            <i class="sui-icon-md icon-phone"></i>
            Log In From Another Device
          </button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
