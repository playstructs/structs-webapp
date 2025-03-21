import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PageHeader} from "../templates/partials/PageHeader";
import {MenuPage} from "../../framework/MenuPage";

export class RecoveryKeyConfirmationViewModel extends AbstractViewModel {
  /**
   * @param {string} mnemonic
   * @param {AuthManager} authManager
   */
  constructor(
    mnemonic,
    authManager
  ) {
    super();
    this.mnemonic = mnemonic;
    this.authManager = authManager;
  }

  initPageCode() {
    const recoveryKeyInput = document.getElementById('recovery-key-input');
    recoveryKeyInput.addEventListener('keyup', () => {
      const submitBtn = document.getElementById('submit-btn');

      if (recoveryKeyInput.value.length > 0 && submitBtn.classList.contains('sui-mod-disabled')) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('sui-mod-disabled');
        submitBtn.classList.add('sui-mod-primary');
      } else if (recoveryKeyInput.value.length === 0 && submitBtn.classList.contains('sui-mod-primary')) {
        submitBtn.disabled = true;
        submitBtn.classList.remove('sui-mod-primary');
        submitBtn.classList.add('sui-mod-disabled');
      }
    });

    const submitBtnHandler = () => {
      const recoveryKeyInput = document.getElementById('recovery-key-input');
      recoveryKeyInput.value = recoveryKeyInput.value.replace(/\s\s+/g, ' ');

      if (recoveryKeyInput.value !== this.mnemonic) {

        MenuPage.router.goto('Auth', 'signupRecoveryKeyConfirmFail', {view: 'CONFIRM_FAIL'});

      } else {

        this.authManager.signup(this.mnemonic).then((success) => {
          if (success) {
            MenuPage.router.goto('Auth', 'signupSuccess');
          } else {
            MenuPage.router.goto('Auth', 'signupRecoveryKeyConfirmFail', {view: 'CONFIRM_FAIL'});
          }
        });

      }
    };

    document.getElementById('submit-btn').addEventListener('click', submitBtnHandler);
    recoveryKeyInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        submitBtnHandler();
      }
    });
  }

  async render() {
    const pageHeader = new PageHeader();
    pageHeader.pageLabel = 'Confirm Recovery Key';
    pageHeader.showBackButton = true;
    pageHeader.backButtonHandler = () => {
      MenuPage.router.goto('Auth', 'signupRecoveryKeyCreation');
    };

    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      ${pageHeader.render()}
        
      <div class="common-layout-col">
        <div class="common-group-col">
          <div>To confirm your Recovery Key, enter each word, in order, separated by spaces.</div>
        </div>
        <div class="common-group-row mod-border">
          <label class="sui-input-text" for="recovery-key-input">
            <span>Confirm Recovery Key</span>
            <input
              type="text"
              name="recovery-key-input"
              id="recovery-key-input"
              placeholder="word word word ..."
            >
          </label>
          <button id="submit-btn" class="sui-screen-btn sui-mod-disabled" disabled>Next</button>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    pageHeader.init();
    this.initPageCode();
  }
}