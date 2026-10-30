import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {UserAgent} from "../../models/UserAgent";
import {PERMISSIONS} from "../../constants/Permissions";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {selectedDevicePermissions} from "../../util/DeviceChangeIntent";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";

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
    this.canRevokeCurrentDevice = false;
    this.saving = false;
  }

  initPageCode() {
    if (this.canEditPermissions) {
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
          const expected=this.playerAddressDetails.permissions;
          const permissions=selectedDevicePermissions(expected,
            document.getElementById(this.manageDevicesCheckboxId).checked,
            document.getElementById(this.transferAssetsCheckboxId).checked);
          this.saving = true;

          const options = new MenuWaitingOptions();
          options.headerBtnLabel = 'Manage Device';
          options.waitingMessage = 'Saving changes.';

          MenuPage.router.goto('Generic', 'menuWaiting', options);

          const signal=MenuPage.router.navigationSignal;
          this.authManager.setDevicePermissions(this.playerAddressDetails.address,permissions,expected,signal).then(success=>{
            if (!signal.aborted) MenuPage.router.goto('Account',success ? 'devices' : 'manageDevice',this.deviceAddress);
          }).catch(error=>{
            if (!signal.aborted) {
              console.debug('[DevicePermissions] change unavailable:',error);
              MenuPage.router.goto('Account','manageDevice',this.deviceAddress);
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
          if (this.isCurrentDevice && !this.canRevokeCurrentDevice) {
            MenuPage.router.goto('Auth', 'logout');
          } else if (!this.isPrimaryDevice && this.playerAddressDetails.alpha && BigInt(this.playerAddressDetails.alpha) > 0n) {
            MenuPage.router.goto('Auth', 'logoutAssetsWarning', this.playerAddressDetails);
          } else if (this.playerAddressDetails.isOnlyManagingDevice) {
            MenuPage.router.goto('Auth', 'logoutPermissionsWarning', this.playerAddressDetails);
          } else if (this.isPrimaryDevice) {
            MenuPage.router.goto('Auth', 'logout');
          } else {
            MenuPage.router.goto('Auth', 'logout', this.playerAddressDetails);
          }
      });
    }
  }

  render() {
    const signal=MenuPage.router.navigationSignal;
    const fetchTargetDevice = this.guildAPI.getPlayerAddress(this.deviceAddress.address,{signal});
    const fetchCurrentDevice = this.isCurrentDevice
      ? fetchTargetDevice
      : this.guildAPI.getPlayerAddress(this.gameState.signingAccount.address,{signal});

    Promise.all([fetchTargetDevice, fetchCurrentDevice]).then(([playerAddress, currentDevicePlayerAddress]) => {
      if (signal.aborted) return;
      if (playerAddress?.address !== this.deviceAddress.address
          || currentDevicePlayerAddress?.address !== this.gameState.signingAccount.address) {
        MenuPage.router.goto('Account','devices');
        return;
      }
      this.playerAddressDetails = playerAddress;
      this.playerAddressDetails.isOnlyManagingDevice = this.deviceAddress.isOnlyManagingDevice;

      const currentDevicePermissions = BigInt(currentDevicePlayerAddress.permissions);
      this.canRevokeCurrentDevice = (currentDevicePermissions & BigInt(PERMISSIONS.DELETE)) !== 0n;
      this.canEditPermissions =
        (currentDevicePermissions & BigInt(this.permissionManager.getManageDevicesPermissions())) === BigInt(this.permissionManager.getManageDevicesPermissions());

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

      const isCheckedManageDevices = (BigInt(playerAddress.permissions) & BigInt(this.permissionManager.getManageDevicesPermissions())) === BigInt(this.permissionManager.getManageDevicesPermissions());
      const isCheckedTransferAssets = (BigInt(playerAddress.permissions) & BigInt(PERMISSIONS.ASSETS_ALL)) === BigInt(PERMISSIONS.ASSETS_ALL);
      const checkboxDisabledAttr = this.canEditPermissions ? '' : 'disabled';

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
                    <div>${userAgent.getDeviceTypeAndOS()}</div>
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
                ${checkboxDisabledAttr}
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
          </div>
          
          ${this.canEditPermissions ? `
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
    }).catch(error=>{
      if (!signal.aborted) {
        console.debug('[DevicePermissions] device unavailable:',error);
        MenuPage.router.goto('Account','devices');
      }
    });
  }
}
