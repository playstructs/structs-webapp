import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";

export class AccountProfileViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} playerId
   */
  constructor(
    gameState,
    guildAPI,
    playerId
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.playerId = playerId;
    this.player = null;
    this.guild = null;
    this.isOwnProfile = (this.playerId === this.gameState.thisPlayerId);
    this.numberFormatter = new NumberFormatter();
    this.editUsernameBtnId = 'account-profile-edit-username-btn';
    this.copyPidBtnId = 'account-profile-copy-pid-btn';
    this.copyPidBtnId2 = 'account-profile-copy-pid-btn-2';
    this.copyAddressBtnId = 'account-profile-copy-address-btn';
    this.alphaMatterId = 'account-profile-alpha-matter';
    this.alphaInfusedId = 'account-profile-alpha-infused';
    this.energyUsageId = 'account-profile-energy-usage';
    this.oreMinedId = 'account-profile-ore-mined';
    this.oreStolenId = 'account-profile-ore-stolen';
    this.oreLostId = 'account-profile-ore-lost';
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.alphaMatterId),
      this.genericResourceComponent.getPageCode(this.alphaInfusedId),
    ];
    this.alphaInfused = 0;
    this.playerOreStats = null;
    this.playerPlanetsCompleted = 0;
    this.playerRaidsLaunched = 0;
  }

  async fetchPageData() {

    if (this.isOwnProfile) {
      this.player = this.gameState.thisPlayer;
      this.guild = this.gameState.thisGuild;
    } else {
      this.player = await this.guildAPI.getPlayer(this.playerId);
      this.guild = await this.guildAPI.getGuild(this.player.guild_id);
    }

    const [
      infusion,
      playerOreStats,
      playerPlanetsCompleted,
      playerRaidsLaunched
    ] = await Promise.all([
      this.guildAPI.getInfusionByPlayerId(this.playerId),
      this.guildAPI.getPlayerOreStats(this.playerId),
      this.guildAPI.getPlayerPlanetsCompleted(this.playerId),
      this.guildAPI.getPlayerRaidsLaunched(this.playerId)
    ])

    this.alphaInfused = infusion.fuel;
    this.playerOreStats = playerOreStats;
    this.playerPlanetsCompleted = playerPlanetsCompleted;
    this.playerRaidsLaunched = playerRaidsLaunched;
  }

  initPageCode() {

    for (let i = 0; i < this.genericResourcePageCode.length; i++) {
      this.genericResourcePageCode[i]();
    }

    if (this.isOwnProfile) {
      document.getElementById(this.editUsernameBtnId).addEventListener('click', function () {
        MenuPage.router.goto('Account', 'changeUsername');
      });
    }

    document.getElementById(this.copyPidBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.playerId);
      }
    }.bind(this));
    document.getElementById(this.copyPidBtnId2).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.playerId);
      }
    }.bind(this));
    document.getElementById(this.copyAddressBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.player.primary_address);
      }
    })
  }

  renderEditUsernameBtnHTML() {
    return this.isOwnProfile
      ? `
        <a id="${this.editUsernameBtnId}" href="javascript: void(0)">
          <i class="sui-icon icon-edit sui-text-secondary"></i>
        </a>
      `
      : '' ;
  }

  getEnergyUsage() {
    const load = this.player.load ? this.player.load : 0;
    const structsLoad = this.player.structs_load ? this.player.structs_load : 0;
    const capacity = this.player.capacity ? this.player.capacity : 0;
    const connectionCapacity = this.player.connection_capacity ? this.player.connection_capacity : 0;

    let totalLoad = load + structsLoad;
    let totalCapacity = capacity + connectionCapacity;
    totalLoad = this.numberFormatter.format(totalLoad);
    totalCapacity = this.numberFormatter.format(totalCapacity);

    return `${totalLoad}/${totalCapacity}`;
  }

  render () {
    this.fetchPageData().then(() => {

      const editUsernameBtn = this.renderEditUsernameBtnHTML();

      if (this.isOwnProfile) {
        MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

        MenuPage.setPageTemplateHeaderBtn('Profile', true, () => {
          MenuPage.router.goto('Account', 'index');
        });
      } else {
        MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

        MenuPage.setPageTemplateHeaderBtn('Guild Profile', true, () => {
          MenuPage.router.back();
        });
      }

      MenuPage.setPageTemplateContent(`
        <div class="profile-layout">
          <div class="profile-header">
            <div class="profile-header-image-container">
              <div class="profile-header-image"></div>
            </div>
            <div class="profile-header-info-container">
              <div class="profile-header-info-name sui-text-display">
                <span class="sui-text-secondary">${this.player.getTag()}</span>
                ${this.player.getUsername()}
                ${editUsernameBtn}
              </div>
              <div class="profile-header-info-player-id">
                #${this.playerId}
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
                <div>${this.guild.name}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Player ID</div>
                <div>
                  #${this.playerId}
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
                <div>
                ${
                  this.genericResourceComponent.renderHTML(
                    this.alphaMatterId,
                    'sui-icon-alpha-matter',
                    'Alpha Matter',
                    this.numberFormatter.format(this.player.alpha)
                  )
                }
                </div>
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
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.energyUsageId,
                      'sui-icon-energy',
                      'Energy usage',
                      this.getEnergyUsage()
                    )
                  }
                </div>
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
