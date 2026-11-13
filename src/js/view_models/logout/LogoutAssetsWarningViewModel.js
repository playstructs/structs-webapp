import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {logoutWording} from "./LogoutWording";
import {NumberFormatter} from "../../util/NumberFormatter";

export class LogoutAssetsWarningViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PlayerAddress} playerAddress
   */
  constructor(gameState, playerAddress) {
    super();
    this.gameState = gameState;
    this.playerAddress = playerAddress;
    this.isPrimaryDevice = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address === this.playerAddress.address;
    this.numberFormatter = new NumberFormatter();
  }

  render() {
    const wording = logoutWording(this.gameState, this.playerAddress);
    const view = new ConfirmTemplate();

    view.headerBtnLabel = wording.headerBtnLabel;

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'IMPORTANT';
    view.messageBody1HTML = `
      The following assets are held by this device. ${wording.ifLoggedOut}, they will be swept to your
      <a
        id="recovery-key-hint"
        class="sui-mod-secondary"
        href="javascript: void(0)"
        data-sui-tooltip="The Player Account holds your funds independently of any signing device."
      >Player Account.</a>
    `;
    view.messageBody2HTML = `
      <a
        id="assets-warning-alpha"
        href="javascript: void(0)"
        class="sui-resource"
        data-sui-tooltip="Alpha Matter"
      >
        <span>${this.numberFormatter.formatExact(this.playerAddress.alpha)}x</span>
        <i class="sui-icon sui-icon-alpha-matter"></i>
      </a>
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
        if (this.playerAddress.isOnlyManagingDevice) {
          MenuPage.router.goto('Auth', 'logoutPermissionsWarning', this.playerAddress);
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
