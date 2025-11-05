import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";

export class LogoutAssetsWarningViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PlayerAddress} playerAddress
   */
  constructor(gameState, playerAddress) {
    super();
    this.gameState = gameState;
    this.playerAddress = playerAddress;
    this.isPrimaryDevice = this.gameState.thisPlayer.primary_address === this.playerAddress.address;
  }

  render() {
    const view = new ConfirmTemplate();

    view.headerBtnLabel = 'Manage Device';

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'IMPORTANT';
    view.messageBody1HTML = `
      The following assets are associated with this device. If this device is logged out, these assets will be migrated to your 
      <a 
        id="recovery-key-hint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="The Primary Account Address is the master address associated with your account, rather than a specific device."
      >Primary Account Address.</a>
    `;
    view.messageBody2HTML = `
      <a
        id="assets-warning-alpha"
        href="javascript: void(0)"
        class="sui-resource"
        data-sui-tooltip="Alpha Matter"
      >
        <span>${this.playerAddress.alpha}x</span>
        <i class="sui-icon sui-icon-alpha-matter"></i>
      </a>
    `;

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = 'Stay Logged In';
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = 'Log Out Now';
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      document.getElementById(view.confirmBtn1Id).addEventListener('click', () => {
        MenuPage.router.back();
      });
      document.getElementById(view.confirmBtn2Id).addEventListener('click', () => {
        if (this.playerAddress.isOnlyManagingDevice) {
          MenuPage.router.goto('Auth', 'logoutPermissionsWarning');
        } else if (this.isPrimaryDevice) {
          MenuPage.router.goto('Auth', 'logout');
        } else {
          MenuPage.router.goto('Auth', 'logout', this.playerAddress);
        }
      });
    };

    view.render();
  }
}