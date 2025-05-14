import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {Blockies} from "../../vendor/Blockies";
import {UserAgent} from "../../models/UserAgent";
import {PlayerAddress} from "../../models/PlayerAddress";

export class AccountDevicesViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AuthManager} authManager
   */
  constructor(
    gameState,
    guildAPI,
    authManager
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.authManager = authManager;
    this.activateNewDeviceBtnId = 'activate-new-device';
    this.blockies = new Blockies();
    this.deviceBlockies = new Map();
  }

  initPageCode() {
    document.getElementById(this.activateNewDeviceBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'newDeviceCode');
    });
    this.deviceBlockies.forEach((blockie, address) => {
      document.getElementById(`device-${address}`).append(blockie);
      document.getElementById(`manage-${address}`).addEventListener('click', () => {
        console.log(`Manage ${address}`);
      });
    })
  }

  /**
   * @param {PlayerAddress} playerAddress
   * @return {string}
   */
  renderDevice(playerAddress) {
    this.deviceBlockies.set(playerAddress.address, this.blockies.createBlockie(playerAddress.address));
    const userAgent = new UserAgent(playerAddress.user_agent);
    const location = playerAddress.ip; // TODO: When geoip data is added, use that field if set
    const lastActivity = new Date(playerAddress.block_time).toLocaleDateString(
      'default',
      {
        month:"long",
        day:"numeric",
        year:"numeric"
      }
    );
    const deviceInfoList = [];

    if (playerAddress.address === this.gameState.signingAccount.address) {
      deviceInfoList.push('This Device');
    } else {
      deviceInfoList.push(`${userAgent.getBrowser()} Browser`);
      deviceInfoList.push(`${userAgent.getDeviceTypeAndOS()}`);
      deviceInfoList.push(`Last Activity: ${lastActivity}`);
    }

    const deviceInfoListHtml = deviceInfoList.reduce((html, info) => html + `<div>${info}</div>`, '');

    return `
      <div class="device-index-row">
        <div id="device-${playerAddress.address}"></div>
        <div class="device-index-row-details-container">
          <div class="device-index-row-info-container">
            <div class="sui-text-header sui-text-primary">${location}</div>
            <div class="device-index-row-info-list">
              ${deviceInfoListHtml}
            </div>
          </div>
        </div>
        <a 
          id="manage-${playerAddress.address}"
          class="sui-screen-btn sui-mod-secondary"
          href="javascript: void(0)"
        >Manage</a>
      </div>
    `;
  }

  render () {
    this.guildAPI.getPlayerAddressList(this.gameState.thisPlayerId).then((playerAddresses) => {

      const deviceListHtml = playerAddresses.reduce((html, playerAddress) => {
        return html + this.renderDevice(playerAddress)
      }, '');

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn(
        'Devices',
        true,
        () => {
        MenuPage.router.goto('Account', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div class="menu-index-layout">
          <button id="${this.activateNewDeviceBtnId}" class="sui-screen-btn sui-mod-primary">Activate New Device</button>
          ${deviceListHtml}
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
