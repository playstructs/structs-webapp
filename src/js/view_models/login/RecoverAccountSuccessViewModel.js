import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class RecoverAccountSuccessViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.playStructsBtnId = 'play-structs-btn';
  }

  initPageCode() {
    document.getElementById(this.playStructsBtnId).addEventListener('click', () => {
      MenuPage.close();
    });
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Recover Account');

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        <div class="device-activation-cancelled-text-container">
          <div class="sui-text-primary">
            <i class="sui-icon sui-icon-md icon-success"></i>
            Success!
          </div>
          <div>Your account has been recovered and you are now logged in.</div>
        </div>        
        
        <div class="device-activation-btn-container">
          <button id="${this.playStructsBtnId}" class="sui-screen-btn sui-mod-primary">Play Structs</button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
