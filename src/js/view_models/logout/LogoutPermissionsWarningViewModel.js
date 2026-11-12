import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {logoutWording} from "./LogoutWording";

export class LogoutPermissionsWarningViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PlayerAddress} playerAddress
   */
  constructor(gameState, playerAddress) {
    super();
    this.gameState = gameState;
    this.playerAddress = playerAddress;
    this.isPrimaryDevice = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address === playerAddress.address;
  }

  render() {
    const wording = logoutWording(this.gameState, this.playerAddress);
    const view = new ConfirmTemplate();

    view.headerBtnLabel = wording.headerBtnLabel;

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'IMPORTANT';
    view.messageBody1HTML = `
      This is the only device that can manage your devices. ${wording.ifLoggedOut}, you will be unable to activate new devices without using your
      <a
        id="recovery-key-hint"
        class="sui-mod-secondary"
        href="javascript: void(0)"
        data-sui-tooltip="The words you saved when you created your account."
      >Recovery Key.</a>
    `;

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = wording.stayLabel;
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = wording.logoutLabel;
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      document.getElementById(view.confirmBtn1Id).addEventListener('click', wording.stay);
      document.getElementById(view.confirmBtn2Id).addEventListener('click', () => {
        if (this.isPrimaryDevice) {
          MenuPage.router.goto('Auth', 'logout');
        } else {
          MenuPage.router.goto('Auth', 'logout', this.playerAddress);
        }
      });
    };

    view.render();
  }
}
