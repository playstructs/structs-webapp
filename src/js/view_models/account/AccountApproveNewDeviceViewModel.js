import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {UserAgent} from "../../models/UserAgent";
import {PlayerAddressPending} from "../../models/PlayerAddressPending";
import {Blockies} from "../../vendor/Blockies";
import {PERMISSIONS} from "../../constants/Permissions";

export class AccountApproveNewDeviceViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {PermissionManager} permissionManager
   * @param {PlayerAddressPending} playerAddressPending
   */
  constructor(
    gameState,
    permissionManager,
    playerAddressPending
  ) {
    super();
    this.gameState = gameState;
    this.permissionManager = permissionManager;
    this.playerAddressPending = playerAddressPending;
    this.blockies = new Blockies();
    this.manageDevicesCheckboxId = 'manageDevicesCheckbox';
    this.transferAssetsCheckboxId = 'transferAssetsCheckbox';
    this.approveDeviceBtnId = 'approveDeviceBtn';
    this.denyDeviceBtnId = 'denyDeviceBtn';
    this.newDeviceBlockieId = 'newDeviceBlockie';
  }

  initPageCode() {
    document.getElementById(`${this.newDeviceBlockieId}`).append(
      this.blockies.createBlockie(this.playerAddressPending.address)
    );
    document.getElementById(`${this.approveDeviceBtnId}`).addEventListener(
      'click',
      () => {
        this.playerAddressPending.permissions = this.permissionManager.getDefaultPlayerPermissions();
        this.playerAddressPending.permissions |= (document.getElementById(this.manageDevicesCheckboxId).checked
          ? this.permissionManager.getManageDevicesPermissions()
          : 0);
        this.playerAddressPending.permissions |= document.getElementById(this.transferAssetsCheckboxId).checked
          ? PERMISSIONS.ASSETS
          : 0;

        MenuPage.router.goto('Account', 'activatingDevice', this.playerAddressPending);
      }
    );
  }

  render() {
    const userAgent = new UserAgent(this.playerAddressPending.user_agent);
    const location = this.playerAddressPending.ip; // TODO: When geoip data is added, use that field if set

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Activate New Device');

    MenuPage.setPageTemplateContent(`
      <div class="account-manage-device-layout">
      
        <div class="account-new-device-info-section">
          <div>The following device is requesting access to your account:</div>
          <div class="account-manage-device-info-box">
            <div class="account-manage-device-info-details">
              <div class="sui-text-header sui-text-primary">New Device</div>
              <div class="device-index-row-info-list">
                <div>${location}</div>
                <div>${userAgent.getBrowser()} Browser</div>
                <div>${userAgent.getDeviceTypeAndOS()}</div>
              </div>
            </div>
            <div class="account-manage-device-info-icon-group">
              <div id="${this.newDeviceBlockieId}"></div>
              <div class="account-manage-device-info-icon-text">
                <div class="sui-text-header">Device Seal</div>
                <div class="sui-text-ticker sui-text-hint">Ensure this image matches the one shown on the device to be activated.</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="account-manage-device-permissions-section">
          <div>Set permissions for the new device:</div>
          <div class="sui-checkbox-container">
            <input 
              type="checkbox" 
              class="sui-checkbox" 
              name="${this.manageDevicesCheckboxId}" 
              id="${this.manageDevicesCheckboxId}"
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
            >
            <span class="sui-checkbox-display"></span>
            <label for="${this.transferAssetsCheckboxId}">Transfer Assets</label>
          </div>
        </div>
        
        <div class="account-new-device-confirm-section">
          <a 
            href="javascript: void(0)" 
            id="${this.approveDeviceBtnId}" 
            class="sui-screen-btn sui-mod-primary"
          >Approve Device</a>
          <a 
            href="javascript: void(0)" 
            id="${this.denyDeviceBtnId}" 
            class="sui-screen-btn sui-mod-destructive"
          >Deny</a>
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
