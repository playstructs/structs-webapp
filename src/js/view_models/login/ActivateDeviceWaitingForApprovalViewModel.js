import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {Blockies} from "../../vendor/Blockies";

export class ActivateDeviceWaitingForApprovalViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {ActivationCodeInfoDTO} activationCodeInfo
   */
  constructor(gameState, activationCodeInfo) {
    super();
    this.gameState = gameState;
    this.activationCodeInfo = activationCodeInfo;
    this.blockies = new Blockies();
    this.blockieWrapperId = 'login-blockie-wrapper';
    this.deviceSealHintId = 'device-seal-hint';
  }

  initPageCode() {
    document.getElementById(this.blockieWrapperId).append(
      this.blockies.createBlockie(this.gameState.signingAccount.address)
    );
    MenuPage.sui.tooltip.init(document.getElementById(this.deviceSealHintId));
  }

  render () {

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId, false);

    MenuPage.setPageTemplateHeaderBtn('Activate Device');

    MenuPage.setPageTemplateContent(`
      <div class="login-activate-device-layout">
        <img src="/img/loading-3-dots.gif" class="loading-3-dots"  alt="3 dots loading animation"/>
        
        <div class="login-activate-device-waiting-for-approval-box">
          <div>
            <span>Please review and confirm the activation request on your logged-in device.</span><br>
            <br>
            <span class="sui-text-warning">Do not close this screen.</span>
          </div>
          <div class="device-seal-container">
            <div id="${this.blockieWrapperId}"></div>
            <div class="device-seal-text-container">
              <div class="sui-text-header">DEVICE SEAL</div>
              <div>
                <a
                  id="${this.deviceSealHintId}" 
                  class="sui-text-ticker sui-text-secondary"
                  href="javascript: void(0)"
                  data-sui-tooltip="Ensure this matches the new device's seal on your other device."
                >What's this?</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();

  }
}
