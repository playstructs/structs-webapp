import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class AccountIndexViewModel extends AbstractViewModel {

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
    this.copyPidBtnId = 'account-menu-copy-pid';
    this.profileBtnId = 'account-menu-profile-btn';
    this.transfersBtnId = 'account-menu-transfers-btn';
    this.devicesBtnId = 'account-menu-devices-btn';
    this.logoutBtnId = 'account-menu-logout-btn';
  }

  initPageCode() {
    document.getElementById(this.copyPidBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id);
      }
    }.bind(this));
    document.getElementById(this.logoutBtnId).addEventListener('click', function () {
      this.authManager.logout();
    }.bind(this));
    document.getElementById(this.profileBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'profile');
    });
    document.getElementById(this.transfersBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'transfers');
    });
    document.getElementById(this.devicesBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'devices');
    });
  }

  render () {
    this.guildAPI.getPlayerAddressCount(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id).then((addressCount) => {

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn('Account');

      MenuPage.setPageTemplateContent(`
        <div class="menu-index-layout">
          <div class="account-menu-index-header-row">
            <div class="account-menu-index-header-player-info">
              <div class="account-menu-index-header-player-name">
                <span class="sui-text-secondary">${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getTag()}</span>
                ${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getUsername()}
              </div>
              <div class="account-menu-index-header-player-id">
                PID #${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}
                <a id="${this.copyPidBtnId}" href="javascript: void(0)">
                  <i class="sui-icon icon-copy sui-text-secondary"></i>
                </a>
              </div>
            </div>
            <div class="account-menu-index-header-btn-container">
              <button id="${this.logoutBtnId}" class="sui-screen-btn sui-mod-destructive">Log Out</button>
            </div>
          </div>
          
          <a id="${this.profileBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-member sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Profile</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div></div>
            </div>
          </a>
          
          <a id="${this.transfersBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-transfers sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Transfers</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div></div>
            </div>
          </a>
          
          <a id="${this.devicesBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-phone sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Devices</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div class="sui-text-secondary">${addressCount} Devices Active</div>
            </div>
          </a>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
