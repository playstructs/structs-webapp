import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PageHeader} from "../templates/partials/PageHeader";
import {MenuPage} from "../../framework/MenuPage";
import {normalizeRecoveryKey} from "../../util/RecoveryKey";
import {bindSubmitButtonToInput} from "../../util/SubmitButtonToggle";

export class RecoveryKeyConfirmationViewModel extends AbstractViewModel {
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
  }

  initPageCode() {
    const recoveryKeyInput = document.getElementById('recovery-key-input');
    const getSubmitBtn = () => document.getElementById('submit-btn');
    bindSubmitButtonToInput(recoveryKeyInput, getSubmitBtn);

    const errorEl = document.getElementById('signup-error');
    let signupInFlight = false;

    const showError = () => {
      errorEl.classList.add('sui-mod-show');
    };

    const hideError = () => {
      errorEl.classList.remove('sui-mod-show');
    };

    const setSubmitting = (submitting) => {
      const submitBtn = getSubmitBtn();
      if (!submitBtn) return;

      submitBtn.disabled = submitting;
      recoveryKeyInput.disabled = submitting;
      if (submitting) {
        submitBtn.textContent = 'Signing Up...';
        submitBtn.classList.remove('sui-mod-primary');
        submitBtn.classList.add('sui-mod-disabled');
      } else {
        submitBtn.textContent = 'Try Again';
        submitBtn.classList.remove('sui-mod-disabled');
        submitBtn.classList.add('sui-mod-primary');
      }
    };

    const onSignupFailed = (error) => {
      if (error) {
        console.error('[Signup] signup request failed:', error);
      }
      signupInFlight = false;
      setSubmitting(false);
      showError();
    };

    const submitBtnHandler = () => {
      if (signupInFlight) return;

      recoveryKeyInput.value = normalizeRecoveryKey(recoveryKeyInput.value);

      if (recoveryKeyInput.value !== this.gameState.mnemonic) {

        MenuPage.router.goto('Auth', 'signupRecoveryKeyConfirmFail', {view: 'CONFIRM_FAIL'});

      } else {

        signupInFlight = true;
        hideError();
        setSubmitting(true);

        // The key already matched locally, so an unsuccessful response is a
        // server-side problem (e.g. guild signer not ready), not a wrong key.
        this.authManager.signup(this.gameState.mnemonic).then((success) => {
          if (success) {
            this.gameState.save();

            MenuPage.router.goto('Auth', 'signupSuccess');
          } else {
            onSignupFailed(null);
          }
        }).catch(onSignupFailed);

      }
    };

    getSubmitBtn().addEventListener('click', submitBtnHandler);
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
        <div class="common-inline-text-input-error-container">
          <div id="signup-error" class="sui-input-text-warning" role="alert">
            We couldn't complete your signup. The guild may be temporarily unavailable. Please try again in a moment.
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    pageHeader.init();
    this.initPageCode();
  }
}