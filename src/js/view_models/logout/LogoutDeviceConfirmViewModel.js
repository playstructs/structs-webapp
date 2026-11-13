import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";
import {logoutWording} from "./LogoutWording";

/**
 * Confirms a Manage Device Log Out that has no assets or permissions warning
 * to show, so no device is logged out with a single press.
 */
export class LogoutDeviceConfirmViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PlayerAddress} playerAddress the device to log out; logoutWithAddress says whether
   *   Auth logout should revoke it by address
   */
  constructor(gameState, playerAddress) {
    super();
    this.gameState = gameState;
    this.playerAddress = playerAddress;
    this.isThisDevice = playerAddress.address === gameState.signingAccount?.address;
  }

  render() {
    const wording = logoutWording(this.gameState, this.playerAddress);
    const view = new ConfirmTemplate();

    view.headerBtnLabel = wording.headerBtnLabel;
    view.headerShowBackBtn = true;
    view.headerBackBtnHandler = wording.stay;

    const recoveryKey = `
      <a
        id="recovery-key-hint"
        class="sui-mod-secondary"
        href="javascript: void(0)"
        data-sui-tooltip="The words you saved when you created your account."
      >Recovery Key</a>`;

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    if (this.isThisDevice) {
      view.messageHeaderText = 'Log out of this device?';
      view.messageBody1HTML = `
        This device's key will be removed from this browser. To play here again you will need your
        ${recoveryKey}
        or approval from another device.
      `;
    } else {
      view.messageHeaderText = 'Log out this device?';
      view.messageBody1HTML = `
        It will lose access to your account. To play on it again you will need your
        ${recoveryKey}
        or approval from another device.
      `;
    }

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = wording.stayLabel;
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = wording.logoutLabel;
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      document.getElementById(view.confirmBtn1Id).addEventListener('click', wording.stay);
      const logoutBtn = document.getElementById(view.confirmBtn2Id);
      logoutBtn.addEventListener('click', () => {
        if (logoutBtn.disabled) return;
        logoutBtn.disabled = true;
        if (this.playerAddress.logoutWithAddress) {
          MenuPage.router.goto('Auth', 'logout', this.playerAddress);
        } else {
          MenuPage.router.goto('Auth', 'logout');
        }
      });
    };

    view.render();
  }
}
