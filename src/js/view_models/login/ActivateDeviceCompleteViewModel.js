import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class ActivateDeviceCompleteViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.playerStructsBtnId = 'player-structs-btn';
  }

  initPageCode() {
    document.getElementById(this.playerStructsBtnId).addEventListener('click', () => {
      MenuPage.close();
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device');

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="device-activation-cancelled-text-container">
          <div class="sui-text-primary">
            <i class="sui-icon sui-icon-md icon-success"></i>
            Activation Completed
          </div>
          <div>Your device has been successfully activated and you are now logged-in.</div>
        </div>        
        
        <div class="device-activation-btn-container">
          <button id="${this.playerStructsBtnId}" class="sui-screen-btn sui-mod-primary">Play Structs</button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
