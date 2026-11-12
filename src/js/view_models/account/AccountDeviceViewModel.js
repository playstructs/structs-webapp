import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {UserAgent} from "../../models/UserAgent";
import {escapeHtml} from "../../util/HtmlEscape";
import {PERMISSIONS} from "../../constants/Permissions";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {selectedDevicePermissions} from "../../util/DeviceChangeIntent";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";
import {deviceLogoutRoute} from "../../util/DeviceLogoutRoute";
import {LOGOUT_FROM} from "../logout/LogoutWording";

export class AccountDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PermissionManager} permissionManager
   * @param {PlayerAddress} deviceAddress
   */
  constructor(
    gameState,
    guildAPI,
    permissionManager,
    deviceAddress,
    authManager,
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.permissionManager = permissionManager;
    this.deviceAddress = deviceAddress;
    this.authManager = authManager;
    this.playerAddressDetails = null;
    this.deviceLogoutBtnId = 'deviceLogoutBtn';
    this.manageDevicesCheckboxId = 'manageDevicesCheckbox';
    this.transferAssetsCheckboxId = 'transferAssetsCheckbox';
    this.cancelDeviceChangesBtnId = 'cancelDeviceChangesBtnId';
    this.saveDeviceChangesBtnId = 'saveDeviceChangesBtn';

    this.isPrimaryDevice = (this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address === this.deviceAddress.address);
    this.isCurrentDevice = (this.gameState.signingAccount.address === this.deviceAddress.address);
    this.canEditPermissions = true;
    // False where nothing can change: no Manage Devices here, or the primary device.
    this.permissionsEditable = true;
    this.canRevokeCurrentDevice = false;
    this.saving = false;
  }

  initPageCode() {
    if (this.permissionsEditable) {
      document.getElementById(`${this.cancelDeviceChangesBtnId}`).addEventListener(
        'click',
        () => {
          MenuPage.router.goto('Account', 'devices');
        }
      );

      document.getElementById(this.saveDeviceChangesBtnId).addEventListener(
        'click',
        () => {
          if (this.saving) return;
          const expected = this.playerAddressDetails.permissions;
          const permissions = selectedDevicePermissions(
            expected,
            document.getElementById(this.manageDevicesCheckboxId).checked,
            document.getElementById(this.transferAssetsCheckboxId).checked
          );
          this.saving = true;

          const options = new MenuWaitingOptions();
          options.headerBtnLabel = 'Manage Device';
          options.waitingMessage = 'Saving changes.';

          MenuPage.router.goto('Generic', 'menuWaiting', options);

          const signal = MenuPage.router.navigationSignal;
          this.authManager.setDevicePermissions(
            this.playerAddressDetails.address,
            permissions,
            expected,
            signal
          ).then(success => {
            if (!signal.aborted) {
              if (success) {
                MenuPage.router.goto('Account', 'devices');
              } else {
                MenuPage.router.goto('Account', 'manageDevice', {...this.deviceAddress, saveFailed: true});
              }
            }
          }).catch(error => {
            if (!signal.aborted) {
              console.debug('[DevicePermissions] change unavailable:', error);
              MenuPage.router.goto('Account', 'manageDevice', {...this.deviceAddress, saveFailed: true});
            }
          });
        }
      );
    }

    const logoutBtn = document.getElementById(this.deviceLogoutBtnId);
    if (logoutBtn) {
      logoutBtn.addEventListener(
        'click',
        () => {
          const route = deviceLogoutRoute({
            isCurrentDevice: this.isCurrentDevice,
            isPrimaryDevice: this.isPrimaryDevice,
            canRevokeCurrentDevice: this.canRevokeCurrentDevice,
            isOnlyManagingDevice: this.playerAddressDetails.isOnlyManagingDevice,
            alpha: this.playerAddressDetails.alpha,
          });
          if (route.withAddress) {
            this.playerAddressDetails.logoutFrom = LOGOUT_FROM.MANAGE_DEVICE;
            MenuPage.router.goto('Auth', route.action, this.playerAddressDetails);
          } else {
            MenuPage.router.goto('Auth', route.action);
          }
      });
    }
  }

  render() {
    const signal = MenuPage.router.navigationSignal;
    const fetchTargetDevice = this.guildAPI.getPlayerAddress(this.deviceAddress.address, {signal});
    const fetchCurrentDevice = this.isCurrentDevice
      ? fetchTargetDevice
      : this.guildAPI.getPlayerAddress(this.gameState.signingAccount.address, {signal});
    // Counted here rather than trusted from the device list, which may be stale.
    const fetchDevices = this.guildAPI.getPlayerAddressList(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id, {signal})
      .catch(error => {
        console.debug('[DevicePermissions] device list unavailable:', error);
        return null;
      });

    Promise.all([fetchTargetDevice, fetchCurrentDevice, fetchDevices]).then(([playerAddress, currentDevicePlayerAddress, devices]) => {
      if (signal.aborted) return;
      if (
        playerAddress?.address !== this.deviceAddress.address
        || currentDevicePlayerAddress?.address !== this.gameState.signingAccount.address
      ) {
        MenuPage.router.goto('Account', 'devices');
        return;
      }
      this.playerAddressDetails = playerAddress;
      const manageDevices = BigInt(this.permissionManager.getManageDevicesPermissions());
      const canManage = (permissions) => (BigInt(permissions ?? 0) & manageDevices) === manageDevices;
      this.playerAddressDetails.isOnlyManagingDevice = devices
        ? canManage(playerAddress.permissions) && devices.filter(device => canManage(device.permissions)).length <= 1
        : this.deviceAddress.isOnlyManagingDevice === true;

      const currentDevicePermissions = BigInt(currentDevicePlayerAddress.permissions);
      this.canRevokeCurrentDevice = (currentDevicePermissions & BigInt(PERMISSIONS.DELETE)) !== 0n;
      this.canEditPermissions =
        (currentDevicePermissions & BigInt(this.permissionManager.getManageDevicesPermissions()))
        === BigInt(this.permissionManager.getManageDevicesPermissions());

      const userAgent = new UserAgent(playerAddress.user_agent);

      let location = playerAddress.ip; // TODO: When geoip data is added, use that field if set
      let logoutSection = '';

      if (this.isPrimaryDevice) {
        location = `[PRIMARY DEVICE]<br>${location}`;
        logoutSection = `
          <div class="account-manage-device-info-icon-group">
            <div class="account-manage-device-info-details">
              <div class="sui-text-header sui-text-secondary">Primary Device Logout</div>
              <div class="sui-text-ticker">Remote logout is not available for primary devices. Please log out using the primary device itself.</div>
            </div>
          </div>
        `;
      } else if (this.isCurrentDevice || this.canEditPermissions) {
        logoutSection = `
          <a 
            href="javascript:void(0)"
            id="${this.deviceLogoutBtnId}"
            class="sui-screen-btn sui-mod-destructive"
          >Log Out</a>
        `;
      }

      const isCheckedManageDevices =
        (BigInt(playerAddress.permissions) & BigInt(this.permissionManager.getManageDevicesPermissions()))
        === BigInt(this.permissionManager.getManageDevicesPermissions());
      const isCheckedTransferAssets =
        (BigInt(playerAddress.permissions) & BigInt(PERMISSIONS.ASSETS_ALL)) === BigInt(PERMISSIONS.ASSETS_ALL);
      // The signer refuses any change that leaves the primary device without full access.
      this.permissionsEditable = this.canEditPermissions && !this.isPrimaryDevice;
      const checkboxDisabledAttr = this.permissionsEditable ? '' : 'disabled';
      // Removing it from the last device that has it would leave nothing able to manage devices.
      const lockManageDevices = !this.isPrimaryDevice
        && isCheckedManageDevices
        && this.playerAddressDetails.isOnlyManagingDevice;
      const manageDevicesDisabledAttr = lockManageDevices ? 'disabled' : checkboxDisabledAttr;

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn(
        'Manage Device',
        true,
        () => {
          MenuPage.router.goto('Account', 'devices');
        });

      MenuPage.setPageTemplateContent(`
        <div class="account-manage-device-layout">

            <div class="account-manage-device-info-box">
            
              <div class="account-manage-device-info-icon-group">
                <i class="sui-icon sui-icon-lg icon-computer sui-text-primary"></i>
                
                <div class="account-manage-device-info-details">
                  <div class="sui-text-header sui-text-primary">${location}</div>
                  <div class="device-index-row-info-list">
                    <div>${userAgent.getBrowser()} Browser</div>
                    <div>${escapeHtml(userAgent.getDeviceTypeAndOS())}</div>
                  </div>
                </div>
              </div>
              
              ${logoutSection}
            </div>
          
          <div class="account-manage-device-permissions-section">
            <div>Device permissions:</div>
            <div class="sui-checkbox-container">
              <input 
                type="checkbox" 
                class="sui-checkbox" 
                name="${this.manageDevicesCheckboxId}" 
                id="${this.manageDevicesCheckboxId}"
                ${isCheckedManageDevices ? 'checked' : ''}
                ${manageDevicesDisabledAttr}
              >
              <span class="sui-checkbox-display"></span>
              <label for="${this.manageDevicesCheckboxId}">
                Manage Devices
                <a 
                  id="manage-devices-tip"
                  class="sui-text-secondary"
                  href="javascript: void(0)" 
                  data-sui-tooltip="The ability to logout other devices or change their permissions."
                >
                  <i class="sui-icon icon-tip"></i>
                </a>
              </label>
            </div>
            ${lockManageDevices ? `
            <div class="sui-text-ticker sui-text-hint">
              This is the only device that can manage devices, so it must keep this permission.
              Give Manage Devices to another device first.
            </div>` : ''}
            <div class="sui-checkbox-container">
              <input 
                type="checkbox" 
                class="sui-checkbox" 
                name="${this.transferAssetsCheckboxId}"
                id="${this.transferAssetsCheckboxId}"
                ${isCheckedTransferAssets ? 'checked' : ''}
                ${checkboxDisabledAttr}
              >
              <span class="sui-checkbox-display"></span>
              <label for="${this.transferAssetsCheckboxId}">
                Transfer Assets
                <a 
                  id="transfer-assets-tip"
                  class="sui-text-secondary"
                  href="javascript: void(0)" 
                  data-sui-tooltip="The ability to send Alpha to other accounts."
                >
                  <i class="sui-icon icon-tip"></i>
                </a>
              </label>
            </div>
            ${this.isPrimaryDevice ? `
            <div class="sui-text-ticker sui-text-hint">
              The primary device always keeps full access, so its permissions cannot be changed.
            </div>` : ''}
          </div>
          
          ${this.deviceAddress.saveFailed ? `
          <div class="sui-text-warning">Your changes were not saved. Please try again.</div>` : ''}

          ${this.permissionsEditable ? `
          <div class="account-new-device-confirm-section">
            <a 
              href="javascript: void(0)" 
              id="${this.cancelDeviceChangesBtnId}" 
              class="sui-screen-btn sui-mod-secondary"
            >Cancel</a>
            <a 
              href="javascript: void(0)" 
              id="${this.saveDeviceChangesBtnId}" 
              class="sui-screen-btn sui-mod-primary"
            >Save</a>
          </div>
          ` : ''}
          
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    }).catch(error => {
      if (!signal.aborted) {
        console.debug('[DevicePermissions] device unavailable:', error);
        MenuPage.router.goto('Account', 'devices');
      }
    });
  }
}
