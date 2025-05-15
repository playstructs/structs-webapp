import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class ActivateDeviceCancelledViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.tryAgainBtnId = 'try-again-btn';
    this.logInWithRecoveryKeyBtnId = 'log-in-with-recovery-key-btn';
  }

  initPageCode() {
    document.getElementById(this.tryAgainBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'loginActivateDevice');
    });
    document.getElementById(this.logInWithRecoveryKeyBtnId).addEventListener('click', () => {
      console.log('Log in with recovery key');
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device');

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="device-activation-cancelled-text-container">
          <div class="sui-text-destructive">
            <i class="sui-icon sui-icon-md icon-alert"></i>
            Activation Cancelled
          </div>
          <div>This device has not been logged in.</div>
        </div>        
        
        <div class="device-activation-btn-container">
          <button id="${this.tryAgainBtnId}" class="sui-screen-btn sui-mod-primary">Try Again</button>
          <button id="${this.logInWithRecoveryKeyBtnId}" class="sui-screen-btn sui-mod-secondary">
            <i class="sui-icon-md icon-key"></i>
            Log In With Recovery Key
          </button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
