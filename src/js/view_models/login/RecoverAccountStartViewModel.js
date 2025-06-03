import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PageHeader} from "../templates/partials/PageHeader";
import {MenuPage} from "../../framework/MenuPage";

export class RecoverAccountStartViewModel extends AbstractViewModel {
  /**
   * @param {GameState} gameState
   * @param {AuthManager} authManager
   */
  constructor(
    gameState,
    authManager
  ) {
    super();
    this.gameState = gameState;
    this.authManager = authManager;
    this.recoveryKeyFaqBtnId = 'recovery-key-faq-link';
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

      MenuPage.router.goto('Auth', 'loggingIn');

      this.authManager.loginWithMnemonic(recoveryKeyInput.value).then(async (success) => {
        if (success) {
          MenuPage.router.goto('Auth', 'loginRecoverAccountSuccess');
        } else {
          MenuPage.router.goto('Auth', 'loginRecoverAccountFail');
        }
      });
    };

    document.getElementById('submit-btn').addEventListener('click', submitBtnHandler);
    recoveryKeyInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        submitBtnHandler();
      }
    });

    document.getElementById(this.recoveryKeyFaqBtnId).addEventListener('click', () => {
      MenuPage.router.goto(
        'Auth',
        'signupRecoveryKeyFaq',
        {
          backButtonHandler: () => {
            MenuPage.router.goto('Auth', 'loginRecoverAccountStart');
          }
        }
      );
    });
  }

  async render() {
    const pageHeader = new PageHeader();
    pageHeader.pageLabel = 'Recovery Account';
    pageHeader.showBackButton = true;
    pageHeader.backButtonHandler = () => {
      MenuPage.router.goto('Auth', 'loginActivateDevice');
    };

    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      ${pageHeader.render()}
        
      <div class="common-layout-col mod-justify-start">
        <div class="recover-account-start-text-container">
          <div>Please enter the 12-word Recovery Key associated with your account.</div>
          <div>
            <a 
              href="javascript:void(0)" 
              id="${this.recoveryKeyFaqBtnId}" 
              class="sui-text-secondary"
            >What is my Recovery Key?</a>
          </div>
        </div>
        <div class="common-group-row mod-border">
          <label class="sui-input-text" for="recovery-key-input">
            <span>Recovery Key</span>
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