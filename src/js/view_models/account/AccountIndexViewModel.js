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
    this.combatTutorialBtnId = 'account-menu-combat-tutorial-btn';
    this.logoutBtnId = 'account-menu-logout-btn';
    this.signingRecoveryBtnId = 'account-menu-signing-recovery-btn';
  }

  /**
   * @return {string|null} why saved signing state blocks new transactions
   */
  signingRecoveryReason() {
    try {
      return this.authManager.signingClientManager?.queue?.savedStateError() ?? null;
    } catch (error) {
      return String(error);
    }
  }

  async recoverSigning(button) {
    button.disabled = true;
    try {
      const moved = await this.authManager.signingClientManager.queue.quarantineSavedState();
      console.info(`[AccountIndexViewModel] set aside ${moved} unreadable signing record(s)`);
      this.render();
    } catch (error) {
      console.warn('[AccountIndexViewModel] signing recovery failed:', error);
      button.disabled = false;
    }
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
    document.getElementById(this.combatTutorialBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'startTutorial');
    });
    const recoveryBtn = document.getElementById(this.signingRecoveryBtnId);
    if (recoveryBtn) {
      recoveryBtn.addEventListener('click', () => this.recoverSigning(recoveryBtn));
    }
  }

  render () {
    const signal = MenuPage.router.navigationSignal;
    const account = this.gameState.signingAccount?.address;
    const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const active = () => !signal.aborted
      && this.gameState.signingAccount?.address === account
      && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id === playerId;
    // Device changes can land elsewhere or without a GRASS notification.
    return this.guildAPI.getPlayerAddressCount(playerId, true, {signal, timeoutMs: 15000}).then((addressCount) => {
      if (!active()) return;

      const signingRecoveryReason = this.signingRecoveryReason();
      if (signingRecoveryReason) console.warn('[AccountIndexViewModel] signing is blocked:', signingRecoveryReason);
      const signingRecoveryHtml = signingRecoveryReason ? `
          <div class="menu-index-btn">
            <i class="sui-icon sui-icon-lg icon-unknown sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class="sui-text-header">Signing Paused</div>
              <div class="sui-text-secondary">
                This browser has saved transaction records it cannot read, so new transactions are paused.
                Setting them aside keeps a copy and resumes signing. A set-aside transaction may already
                have been sent, so check your balances before repeating an action.
              </div>
              <button id="${this.signingRecoveryBtnId}" class="sui-screen-btn sui-mod-destructive">Set Aside and Continue</button>
            </div>
          </div>
      ` : '';

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn('Account');

      MenuPage.setPageTemplateContent(`
        <div class="menu-index-layout">
          <div class="account-menu-index-header-row">
            <div class="account-menu-index-header-player-info">
              <div class="account-menu-index-header-player-name sui-text-header">
                <span class="sui-text-secondary">${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getTag()}</span>
                ${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].getUsername()}
              </div>
              <div class="account-menu-index-header-player-id sui-text-header">
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
          ${signingRecoveryHtml}
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
          
          <a id="${this.combatTutorialBtnId}" class="menu-index-btn" href="javascript: void(0)">
            <i class="sui-icon sui-icon-lg icon-unknown sui-text-primary"></i>
            <div class="menu-index-btn-labels-container">
              <div class=menu-index-btn-nav-label>
                <span class="sui-text-header">Combat Tutorial</span>
                <i class="sui-icon icon-chevron-right sui-text-primary"></i>
              </div>
              <div></div>
            </div>
          </a>
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    }).catch(error => {
      if (active()) console.warn('[AccountIndexViewModel] read failed:', error);
    });
  }
}
