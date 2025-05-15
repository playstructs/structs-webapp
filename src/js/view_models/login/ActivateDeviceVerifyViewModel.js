import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ActivationCodeInfoDTO} from "../../dtos/ActivationCodeInfoDTO";

export class ActivateDeviceVerifyViewModel extends AbstractViewModel {

  /**
   * @param {GuildAPI} guildAPI
   * @param {ActivationCodeInfoDTO | null} activationCodeInfo
   */
  constructor(
    guildAPI,
    activationCodeInfo
  ) {
    super();
    this.guildAPI = guildAPI;
    this.activationCodeInfo = activationCodeInfo;
    this.yesBtnId = 'yes-btn';
    this.noBtnId = 'no-btn';
  }

  initPageCode() {
    document.getElementById(this.noBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'loginActivateDeviceCancelled');
    });
    document.getElementById(this.yesBtnId).addEventListener('click', () => {
      console.log('Yes, this is me', this.activationCodeInfo.code);
    });
  }

  render () {

    if (this.activationCodeInfo === null) {
      MenuPage.router.goto('Auth', 'loginActivateDevice');
      return;
    }

    const tag = this.activationCodeInfo.tag ? `[${this.activationCodeInfo.tag}]` : '';
    const username = this.activationCodeInfo.username ? this.activationCodeInfo.username : '';
    const playerId = this.activationCodeInfo.player_id;

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device', true, () => {
      MenuPage.router.goto('Auth', 'loginActivateDevice');
    });

    MenuPage.setPageTemplateContent(`
      <div class="login-activate-device-layout">
        <div>Is this your account?</div>
        
        <div class="login-code-info-container">
          <div class="set-username-pfp"></div>
          <div class="login-code-info-details">
            <div class="login-code-info-name">
              <div class="sui-text-display sui-text-secondary">${tag}</div>
              <div class="sui-text-display">${username}</div>
            </div>
            <div class="login-code-data-row">
              <div class="login-code-data-row-label sui-text-hint">Player ID</div>
              <div class="login-code-data-row-value">#${playerId}</div>
            </div>
          </div>
        </div>
        
        <div class="login-verify-code-account-btn-wrapper">
          <button id="${this.noBtnId}" class="sui-screen-btn sui-mod-destructive">This Isn't Me</button>
          <button id="${this.yesBtnId}" class="sui-screen-btn sui-mod-primary">Yes, This Is Me</button>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();


  }
}
