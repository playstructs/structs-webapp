import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountDeviceActivationComplete extends AbstractViewModel {

  constructor() {
    super();
    this.returnToAccountBtnId = 'return-to-account-btn';
  }

  initPageCode() {
    document.getElementById(this.returnToAccountBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'index');
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate New Device');

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="device-activation-cancelled-text-container">
          <div class="sui-text-primary">
            <i class="sui-icon sui-icon-md icon-success"></i>
            Device Approved
          </div>
          <div>The new device has been activated.</div>
        </div>        
        
        <div class="device-activation-btn-container">
          <button id="${this.returnToAccountBtnId}" class="sui-screen-btn sui-mod-primary">Return to Account</button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
