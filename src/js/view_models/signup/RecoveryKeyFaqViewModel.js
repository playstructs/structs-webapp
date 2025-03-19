import {PageHeader} from "../templates/partials/PageHeader";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class RecoveryKeyFaqViewModel extends AbstractViewModel {

  /**
   * @param {function} backButtonHandler
   */
  constructor(backButtonHandler) {
    super();
    this.backButtonHandler = backButtonHandler;
  }

  render() {
    const pageHeader = new PageHeader();
    pageHeader.pageLabel = 'About Recovery Keys';
    pageHeader.showBackButton = true;
    pageHeader.backButtonHandler = this.backButtonHandler;

    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      ${pageHeader.render()}
        
      <div class="recovery-key-faq-layout">
        <div class="recovery-key-faq-question-group">
          <div class="sui-text-secondary">What is a Recovery Key?</div>
          <div>Your recovery key is the 12-word secrect code that was given to you created your account.</div>
        </div>
        <div class="recovery-key-faq-question-group">
          <div class="sui-text-secondary">Why do I need my Recovery Key?</div>
          <div>In the event that you lose access to your account, you can use your Recovery Key to log in.</div>
        </div>
        <div class="recovery-key-faq-question-group">
          <div class="sui-text-secondary">How can I protect my Recovery Key?</div>
          <div>It is important to write down your Recovery Key and keep it in a safe place. You may also consider saving your Recovery Key to a password manager. We do not store Recovery Keys and cannot help you retrieve your Key if you lose it.</div>
        </div>
        <div class="recovery-key-faq-question-group">
          <div class="sui-text-secondary">I want to log in on a new device. Do I need my recovery Key?</div>
          <div>No. If you currently have access to a logged-in device, you can log in a new device by using the Login From Another Device option.<br> 
            <br>
            Note: this option is only available if the logged-in device has Account Management permissions.<br>
            <br>
            If you have no currently logged-in devices with Account Management permissions, you will need to use your Recovery Key to log in again.
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    pageHeader.init();
  }
}