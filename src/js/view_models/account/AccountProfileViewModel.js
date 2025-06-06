import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {EnergyUsageComponent} from "../components/EnergyUsageComponent";
import {AlphaOwnedComponent} from "../components/AlphaOwnedComponent";
import {GenericResourceComponent} from "../components/GenericResourceComponent";

export class AccountProfileViewModel extends AbstractViewModel {

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
    this.alphaInfusedId = 'account-profile-alpha-infused';
    this.oreMinedId = 'account-profile-ore-mined';
    this.oreStolenId = 'account-profile-ore-stolen';
    this.oreLostId = 'account-profile-ore-lost';
    this.alphaOwnedComponent = new AlphaOwnedComponent(gameState, 'account-profile-alpha-owned');
    this.energyUsageComponent = new EnergyUsageComponent(gameState, 'account-profile-energy-usage');
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.alphaInfusedId)
    ];
    this.alphaInfused = 0;
    this.playerOreStats = null;
    this.playerPlanetsCompleted = 0;
    this.playerRaidsLaunched = 0;
  }

  async fetchPageData() {
    const infusion = await this.guildAPI.getInfusionByPlayerId(this.gameState.thisPlayerId);
    this.alphaInfused = infusion.fuel;
    this.playerOreStats = await this.guildAPI.getPlayerOreStats(this.gameState.thisPlayerId);
    this.playerPlanetsCompleted = await this.guildAPI.getPlayerPlanetsCompleted(this.gameState.thisPlayerId);
    this.playerRaidsLaunched = await this.guildAPI.getPlayerRaidsLaunched(this.gameState.thisPlayerId);
  }

  initPageCode() {
    this.alphaOwnedComponent.initPageCode();
    this.energyUsageComponent.initPageCode();

    for (let i = 0; i < this.genericResourcePageCode.length; i++) {
      this.genericResourcePageCode[i]();
    }

    document.getElementById(this.editUsernameBtnId).addEventListener('click', function () {
      MenuPage.router.goto('Account', 'changeUsername');
    });
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
    this.fetchPageData().then(() => {

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
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Player Details</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                <div>Guild</div>
                <div>${this.gameState.thisGuild.name}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Player ID</div>
                <div>
                  #${this.gameState.thisPlayerId}
                  <a id="${this.copyPidBtnId2}" href="javascript: void(0)">
                    <i class="sui-icon icon-copy sui-text-secondary"></i>
                  </a>
                </div>
              </div>
              <div class="sui-data-card-row">
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
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Power</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                <div>Alpha Matter</div>
                <div>${this.alphaOwnedComponent.renderHTML()}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Alpha Infused</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.alphaInfusedId, 
                      'sui-icon-alpha-matter', 
                      'Alpha Infused', 
                      this.alphaInfused
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Energy Usage</div>
                <div>${this.energyUsageComponent.renderHTML()}</div>
              </div>
            </div>
          </div>
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Statistics</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                <div>Planets Completed</div>
                <div>${this.playerPlanetsCompleted}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Raids Launched</div>
                <div>${this.playerRaidsLaunched}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Ore Mined</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.oreMinedId,
                      'sui-icon-alpha-ore',
                      'Ore Mined',
                      this.playerOreStats.mined
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Ore Stolen</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.oreStolenId,
                      'sui-icon-alpha-ore',
                      'Ore Stolen',
                      this.playerOreStats.seized
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Ore Lost</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.oreLostId,
                      'sui-icon-alpha-ore',
                      'Ore Lost',
                      this.playerOreStats.forfeited
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          
        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();

    });
  }
}
