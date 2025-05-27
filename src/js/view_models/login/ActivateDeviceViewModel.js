import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {CODE_PATTERN} from "../../constants/RegexPattern";

export class ActivateDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GuildAPI} guildAPI
   */
  constructor(guildAPI) {
    super();
    this.guildAPI = guildAPI;
    this.activationCodeInputId = 'activationCode';
    this.activationCodeInputErrorId = 'activation-code-input-error';
    this.activationCodeSubmitBtnId = 'activation-code-submit-btn';
    this.logInWithRecoveryKeyBtnId = 'log-in-with-recovery-key-btn';
    this.errorMessage = 'Activation Code is invalid or has expired.'
  }

  initPageCode() {
    const errorElm = document.getElementById(this.activationCodeInputErrorId);

    document.getElementById(this.activationCodeSubmitBtnId).addEventListener('click', () => {

      errorElm.innerHTML = '';
      const input = document.getElementById(this.activationCodeInputId);
      let code = input.value.toUpperCase();
      input.value = code;

      if (!CODE_PATTERN.test(code)) {
        errorElm.innerHTML = this.errorMessage;
        return;
      }

      this.guildAPI.getActivationCodeInfo(code).then(info => {

        if (info === null) {
          errorElm.innerHTML = this.errorMessage;
          return;
        }

        MenuPage.router.goto('Auth', 'loginActivateDeviceVerify', info);

      }).catch(() => {
        errorElm.innerHTML = this.errorMessage;
      });
    });

    document.getElementById(this.logInWithRecoveryKeyBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'loginRecoverAccountStart');
    })
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device', true, () => {
      MenuPage.router.goto('Auth', 'index');
    });

    MenuPage.setPageTemplateContent(`
      <div class="login-activate-device-layout">
        <div>To receive an activation code, go to <span class="sui-text-secondary">Account > Devices</span> on any logged in device.</div>
        
        <div class="login-activation-code-input-wrapper">
          <div class="login-activation-code-input-group">
            <label class="sui-input-text" for="activationCode">
              <span>Activation Code</span>
              <input
                type="text"
                name="${this.activationCodeInputId}"
                id="${this.activationCodeInputId}"
                placeholder="Enter Code"
              >
            </label>
            <div id="${this.activationCodeInputErrorId}" class="sui-input-text-warning sui-mod-show"></div>
          </div>
          <button id="${this.activationCodeSubmitBtnId}" class="sui-screen-btn sui-mod-primary">Submit</button>
        </div>
        
        <div class="login-with-recovery-key-wrapper">
          <div>Not logged in anywhere else?</div>
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
