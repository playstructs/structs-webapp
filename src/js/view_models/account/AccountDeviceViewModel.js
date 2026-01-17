import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {UserAgent} from "../../models/UserAgent";
import {PERMISSIONS} from "../../constants/Permissions";
import {SetAddressPermissionsRequestDTO} from "../../dtos/SetAddressPermissionsRequestDTO";
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
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.permissionManager = permissionManager;
    this.deviceAddress = deviceAddress;
    this.playerAddressDetails = null;
    this.deviceLogoutBtnId = 'deviceLogoutBtn';
    this.manageDevicesCheckboxId = 'manageDevicesCheckbox';
    this.transferAssetsCheckboxId = 'transferAssetsCheckbox';
    this.cancelDeviceChangesBtnId = 'cancelDeviceChangesBtnId';
    this.saveDeviceChangesBtnId = 'saveDeviceChangesBtn';

    this.isPrimaryDevice = (this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address === this.deviceAddress.address);
  }

  initPageCode() {
    document.getElementById(`${this.cancelDeviceChangesBtnId}`).addEventListener(
      'click',
      () => {
        MenuPage.router.goto('Account', 'devices');
      }
    );

    document.getElementById(this.saveDeviceChangesBtnId).addEventListener(
      'click',
      () => {
        const request = new SetAddressPermissionsRequestDTO();
        request.address = this.playerAddressDetails.address;
        request.permissions = this.permissionManager.getDefaultPlayerPermissions();
        request.permissions |= (document.getElementById(this.manageDevicesCheckboxId).checked
          ? this.permissionManager.getManageDevicesPermissions()
          : 0);
        request.permissions |= document.getElementById(this.transferAssetsCheckboxId).checked
          ? PERMISSIONS.ASSETS
          : 0;

        const options = new MenuWaitingOptions();
        options.headerBtnLabel = 'Manage Device';
        options.waitingMessage = 'Saving changes.';

        MenuPage.router.goto('Generic', 'menuWaiting', options);

        this.guildAPI.setAddressPermissions(request).then(() => {
          MenuPage.router.goto('Account', 'devices');
        });
      }
    );

    document.getElementById(this.deviceLogoutBtnId).addEventListener(
      'click',
      () => {
        if (!this.isPrimaryDevice && this.playerAddressDetails.alpha) {
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

  render() {

    this.guildAPI.getPlayerAddress(this.deviceAddress.address).then((playerAddress) => {
      this.playerAddressDetails = playerAddress;
      this.playerAddressDetails.isOnlyManagingDevice = this.deviceAddress.isOnlyManagingDevice;

      const userAgent = new UserAgent(playerAddress.user_agent);

      let location = playerAddress.ip; // TODO: When geoip data is added, use that field if set
      let logoutSection = `
        <a 
          href="javascript:void(0)"
          id="${this.deviceLogoutBtnId}"
          class="sui-screen-btn sui-mod-destructive"
        >Log Out</a>
      `;

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
      }

      const isCheckedManageDevices = (parseInt(playerAddress.permissions) & this.permissionManager.getManageDevicesPermissions()) === this.permissionManager.getManageDevicesPermissions();
      const isCheckedTransferAssets = (parseInt(playerAddress.permissions) & PERMISSIONS.ASSETS) === PERMISSIONS.ASSETS;

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
              >
              <span class="sui-checkbox-display"></span>
              <label for="${this.manageDevicesCheckboxId}">Manage Devices</label>
            </div>
            <div class="sui-checkbox-container">
              <input 
                type="checkbox" 
                class="sui-checkbox" 
                name="${this.transferAssetsCheckboxId}"
                id="${this.transferAssetsCheckboxId}"
                ${isCheckedTransferAssets ? 'checked' : ''}
              >
              <span class="sui-checkbox-display"></span>
              <label for="${this.transferAssetsCheckboxId}">Transfer Assets</label>
            </div>
          </div>
          
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
          
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
