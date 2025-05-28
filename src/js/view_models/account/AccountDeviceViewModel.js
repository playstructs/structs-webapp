import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {UserAgent} from "../../models/UserAgent";
import {PERMISSIONS} from "../../constants/Permissions";
import {SetAddressPermissionsRequestDTO} from "../../dtos/SetAddressPermissionsRequestDTO";

export class AccountDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {PermissionManager} permissionManager
   * @param {string} deviceAddress
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
    this.manageDevicesCheckboxId = 'manageDevicesCheckbox';
    this.transferAssetsCheckboxId = 'transferAssetsCheckbox';
    this.cancelDeviceChangesBtnId = 'cancelDeviceChangesBtnId';
    this.saveDeviceChangesBtnId = 'saveDeviceChangesBtn';
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
        request.address = this.deviceAddress;
        request.permissions = this.permissionManager.getDefaultPlayerPermissions();
        request.permissions |= (document.getElementById(this.manageDevicesCheckboxId).checked
          ? this.permissionManager.getManageDevicesPermissions()
          : 0);
        request.permissions |= document.getElementById(this.transferAssetsCheckboxId).checked
          ? PERMISSIONS.ASSETS
          : 0;

        this.guildAPI.setAddressPermissions(request).then(() => {
          MenuPage.router.goto('Account', 'devices');
        });
      }
    )
  }

  render() {

    this.guildAPI.getPlayerAddress(this.deviceAddress).then((playerAddress) => {
      const userAgent = new UserAgent(playerAddress.user_agent);
      const location = playerAddress.ip; // TODO: When geoip data is added, use that field if set
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
        <div class="account-approve-new-device-layout">
          <div class="account-new-device-info-section">
            <div class="account-new-device-info-box">
            
              <div class="account-new-device-info-seal-group">
                <i class="sui-icon sui-icon-lg icon-computer sui-text-primary"></i>
                
                <div class="account-new-device-info-details">
                  <div class="sui-text-primary">${location}</div>
                  <div class="device-index-row-info-list">
                    <div>${userAgent.getBrowser()} Browser</div>
                    <div>${userAgent.getDeviceTypeAndOS()}</div>
                  </div>
                </div>
              </div>
              
              <a href="javascript:void(0)" class="sui-screen-btn sui-mod-destructive">Log Out</a>
            </div>
          </div>
          
          <div class="account-new-device-permissions-section">
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
