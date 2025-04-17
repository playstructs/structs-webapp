import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountProfileView extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI,
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.editUsernameBtnId = 'account-profile-edit-username-btn';
    this.copyPidBtnId = 'account-profile-copy-pid-btn';
    this.copyPidBtnId2 = 'account-profile-copy-pid-btn-2';
    this.copyAddressBtnId = 'account-profile-copy-address-btn';
  }

  initPageCode() {
    document.getElementById(this.editUsernameBtnId).addEventListener('click', function () {
      console.log('Edit Username');
    }.bind(this));
    document.getElementById(this.copyPidBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.gameState.thisPlayerId);
      }
    }.bind(this));
    document.getElementById(this.copyPidBtnId2).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.gameState.thisPlayerId);
      }
    }.bind(this));
    document.getElementById(this.copyAddressBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.gameState.thisPlayer.primary_address);
      }
    })
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Profile', true, () => {
      MenuPage.router.goto('Account', 'index');
    });

    MenuPage.setPageTemplateContent(`
      <div class="profile-layout">
        <div class="profile-header">
          <div class="profile-header-image-container">
            <div class="profile-header-image"></div>
          </div>
          <div class="profile-header-info-container">
            <div class="profile-header-info-name sui-text-display">
              <span class="sui-text-secondary">${this.gameState.getPlayerTag()}</span>
              ${this.gameState.getPlayerUsername()}
              <a id="${this.editUsernameBtnId}" href="javascript: void(0)">
                <i class="sui-icon icon-edit sui-text-secondary"></i>
              </a>
            </div>
            <div class="profile-header-info-player-id">
              #${this.gameState.thisPlayerId}
              <a id="${this.copyPidBtnId}" href="javascript: void(0)">
                <div class="icon-wrapper">
                  <i class="sui-icon icon-copy sui-text-secondary"></i>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div class="profile-data-card">
          <div class="profile-data-card-header sui-text-header">Player Details</div>
          <div class="profile-data-card-body">
            <div class="profile-data-card-row">
              <div>Guild</div>
              <div>${this.gameState.thisGuild.name}</div>
            </div>
            <div class="profile-data-card-row">
              <div>Player ID</div>
              <div>
                #${this.gameState.thisPlayerId}
                <a id="${this.copyPidBtnId2}" href="javascript: void(0)">
                  <i class="sui-icon icon-copy sui-text-secondary"></i>
                </a>
              </div>
            </div>
            <div class="profile-data-card-row">
              <div>Blockchain Address</div>
              <div>
                Copy Address
                <a id="${this.copyAddressBtnId}" href="javascript:void(0)">
                  <i class="sui-icon icon-copy sui-text-secondary"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
