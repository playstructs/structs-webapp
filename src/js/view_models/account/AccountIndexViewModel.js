import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountIndexView extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.playerAddressCount = 0;
  }

  getTag() {
    return this.gameState.thisPlayer.tag && this.gameState.thisPlayer.tag.length > 0
      ? `[${this.gameState.thisPlayer.tag}]`
      : '';
  }

  getUsername() {
    return this.gameState.thisPlayer.username && this.gameState.thisPlayer.username.length > 0
      ? this.gameState.thisPlayer.username
      : 'Name Redacted';
  }

  initPageCode() {

  }

  render () {
    this.guildAPI.getPlayerAddressCount(this.gameState.thisPlayerId).then((addressCount) => {

      const navItems = [
        new NavItemDTO(
          'nav-item-fleet',
          'FLEET'
        ),
        new NavItemDTO(
          'nav-item-guild',
          'GUILD'
        ),
        new NavItemDTO(
          'nav-item-account',
          'ACCOUNT'
        )
      ];
      MenuPage.setNavItems(navItems, 'nav-item-account');
      MenuPage.enableCloseBtn();

      MenuPage.enablePageTemplate();

      MenuPage.setPageTemplateNavBtn('Account');

      MenuPage.setPageTemplateContent(`
        <div class="menu-index-layout">
          <div class="account-menu-index-header-row">
            <div class="account-menu-index-header-player-info">
              <div class="account-menu-index-header-player-name">
                <span class="sui-text-secondary">${this.getTag()}</span>
                ${this.getUsername()}
              </div>
              <div class="account-menu-index-header-player-id">
                PID #${this.gameState.thisPlayerId}
                <i class="sui-icon icon-copy sui-text-secondary"></i>
              </div>
            </div>
            <div class="account-menu-index-header-btn-container">
              <button class="sui-screen-btn sui-mod-destructive">Log Out</button>
            </div>
          </div>
          <div class="menu-index-btn">
            <i class="sui-icon sui-icon-lg icon-member sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                Profile
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div></div>
            </div>
          </div>
          <div class="menu-index-btn">
            <i class="sui-icon sui-icon-lg icon-member sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                Transfers
                <i class="sui-icon icon-transfers sui-text-primary"></i>
              </div>
              <div></div>
            </div>
          </div>
          <div class="menu-index-btn">
            <i class="sui-icon sui-icon-lg icon-phone sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                Devices
                <i class="sui-icon icon-transfers sui-text-primary"></i>
              </div>
              <div class="sui-text-secondary">${addressCount} Devices Active</div>
            </div>
          </div>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
