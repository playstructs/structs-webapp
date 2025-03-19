import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PageHeader} from "../templates/partials/PageHeader";
import {MenuPage} from "../../framework/MenuPage";

export class SignupSuccessViewModel extends AbstractViewModel {

  initPageCode() {
    document.getElementById('return-to-game-btn').addEventListener('click', () => {
      console.log('return to game');
    });
  }

  render() {
    const pageHeader = new PageHeader();
    pageHeader.pageLabel = 'Success!';

    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      ${pageHeader.render()}
        
      <div class="common-layout-col">
        <div class="common-group-col">
          <div>
            <i class="sui-icon-md icon-alert sui-text-primary"></i>
            <span class="sui-text-primary">Success!</span>
          </div>
          <div>Your account has been created. Keep your Recovery Key safe; you will need it if you lose access to your account.</div>
        </div>
        <div>
          <button id="return-to-game-btn" class="sui-screen-btn sui-mod-secondary" >Return To Game</button>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}