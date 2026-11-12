import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {ConfirmTemplate} from "../templates/ConfirmTemplate";
import {PERMISSIONS} from "../../constants/Permissions";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {deviceLogoutRoute} from "../../util/DeviceLogoutRoute";
import {LOGOUT_FROM} from "../logout/LogoutWording";

/**
 * Confirms Log Out from the Account page, then hands off to the same assets
 * and permissions warnings that Manage Device shows for this device.
 */
export class AccountLogoutConfirmViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PermissionManager} permissionManager
   */
  constructor(gameState, guildAPI, permissionManager) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.permissionManager = permissionManager;
  }

  /**
   * @param {AbortSignal} signal
   * @return {Promise<{action: string, withAddress: boolean, playerAddress: PlayerAddress|null}>}
   */
  async resolveRoute(signal) {
    const address = this.gameState.signingAccount.address;
    const player = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
    const [playerAddress, playerAddresses] = await Promise.all([
      this.guildAPI.getPlayerAddress(address, {signal}),
      this.guildAPI.getPlayerAddressList(player.id, {signal}),
    ]);
    if (playerAddress?.address !== address) {
      throw new Error('this device is not registered to the player');
    }

    const manageDevices = BigInt(this.permissionManager.getManageDevicesPermissions());
    const canManage = (permissions) => (BigInt(permissions ?? 0) & manageDevices) === manageDevices;
    const managingDevices = playerAddresses.filter(device => canManage(device.permissions)).length;
    playerAddress.isOnlyManagingDevice = canManage(playerAddress.permissions) && managingDevices <= 1;
    playerAddress.logoutFrom = LOGOUT_FROM.ACCOUNT;

    const route = deviceLogoutRoute({
      isCurrentDevice: true,
      isPrimaryDevice: player.player.primary_address === address,
      canRevokeCurrentDevice: (BigInt(playerAddress.permissions ?? 0) & BigInt(PERMISSIONS.DELETE)) !== 0n,
      isOnlyManagingDevice: playerAddress.isOnlyManagingDevice,
      alpha: playerAddress.alpha,
    });
    return {...route, playerAddress};
  }

  render() {
    const signal = MenuPage.router.navigationSignal;
    // Fetched while the player reads the page; Log Out waits for it.
    const routePromise = this.resolveRoute(signal).catch(error => {
      if (!signal.aborted) {
        console.warn('[Logout] device details unavailable, logging out locally:', error);
      }
      return {action: 'logout', withAddress: false, playerAddress: null};
    });

    const view = new ConfirmTemplate();

    view.headerBtnLabel = 'Log Out';
    view.headerShowBackBtn = true;
    view.headerBackBtnHandler = () => MenuPage.router.goto('Account', 'index');

    view.messageHeaderColorClass = 'sui-mod-warning';
    view.messageHeaderIconClass = 'icon-alert';
    view.messageHeaderText = 'Log out of this device?';
    view.messageBody1HTML = `
      This device's key will be removed from this browser. To play here again you will need your
      <a
        id="recovery-key-hint"
        class="sui-mod-secondary"
        href="javascript: void(0)"
        data-sui-tooltip="The words you saved when you created your account."
      >Recovery Key</a>
      or approval from another device.
    `;

    view.confirmBtn1Enabled = true;
    view.confirmBtn1Label = 'Stay Logged In';
    view.confirmBtn1ColorClass = 'sui-mod-primary';

    view.confirmBtn2Enabled = true;
    view.confirmBtn2Label = 'Log Out';
    view.confirmBtn2ColorClass = 'sui-mod-destructive';

    view.initPageCode = () => {
      document.getElementById(view.confirmBtn1Id).addEventListener('click', () => {
        MenuPage.router.goto('Account', 'index');
      });
      const logoutBtn = document.getElementById(view.confirmBtn2Id);
      logoutBtn.addEventListener('click', () => {
        logoutBtn.disabled = true;
        routePromise.then(route => {
          if (signal.aborted) return;
          if (route.withAddress) {
            MenuPage.router.goto('Auth', route.action, route.playerAddress);
          } else {
            MenuPage.router.goto('Auth', route.action);
          }
        });
      });
    };

    view.render();
  }
}
