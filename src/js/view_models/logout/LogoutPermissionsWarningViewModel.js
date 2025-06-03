import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";

export class LogoutPermissionsWarningViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PlayerAddress} playerAddress
   */
  constructor(gameState, playerAddress) {
    super();
    this.gameState = gameState;
    this.playerAddress = playerAddress;
  }

  render() {
    const view = new ConfirmTemplate();

    view.headerBtnLabel = 'Manage Device';

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'IMPORTANT';
    view.messageBody1HTML = `
      This is the only device with Manage Device permissions active. If these permissions are removed, you will be unable to activate new devices without using your
      <a 
        id="recovery-key-hint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="The Primary Account Address is the master address associated with your account, rather than a specific device."
      >Recovery Key.</a>
    `;

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = 'Save Changes';
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = 'Cancel';
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      MenuPage.sui.tooltip.init(document.getElementById('recovery-key-hint'));

      document.getElementById(view.confirmBtn1Id).addEventListener('click', () => {
        if (this.isPrimaryDevice) {
          MenuPage.router.goto('Auth', 'logout');
        } else {
          MenuPage.router.goto('Auth', 'logout', this.playerAddress);
        }
      });
      document.getElementById(view.confirmBtn2Id).addEventListener('click', () => {
        MenuPage.router.back();
      });
    };

    view.render();
  }
}