import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";

export class GuildProfileViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} guildId
   */
  constructor(
    gameState,
    guildAPI,
    guildId
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.guildId = guildId;
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();

    this.copyGidBtnId = 'guild-profile-copy-gid-btn';
    this.guildMinimumId = 'guild-profile-guild-minimum';
    this.baseEnergySupplyId = 'guild-profile-base-energy-supply';
    this.commissionId = 'guild-profile-commission';
    this.alphaInfusedId = 'guild-profile-alpha-infused';
    this.energyUsageId = 'guild-profile-energy-usage';

    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.guildMinimumId),
      this.genericResourceComponent.getPageCode(this.baseEnergySupplyId),
      this.genericResourceComponent.getPageCode(this.commissionId),
      this.genericResourceComponent.getPageCode(this.alphaInfusedId),
      this.genericResourceComponent.getPageCode(this.energyUsageId),
    ];

    this.guild = null;
    this.powerStats = 0;
    this.membersCount = null;
    this.completePlanetsCount = 0;
  }

  async fetchPageData() {

    const [guild, powerStats, membersCount, completePlanetsCount] = await Promise.all([
      this.guildAPI.getGuild(this.guildId),
      this.guildAPI.getGuildPowerStats(this.guildId),
      this.guildAPI.countGuildMembers(this.guildId),
      this.guildAPI.countGuildPlanetsCompleted(this.guildId)
    ]);

     this.guild = guild;
     this.powerStats = powerStats;
     this.membersCount = membersCount;
     this.completePlanetsCount = completePlanetsCount;
  }

  initPageCode() {
    for (let i = 0; i < this.genericResourcePageCode.length; i++) {
      this.genericResourcePageCode[i]();
    }
    document.getElementById(this.copyGidBtnId).addEventListener('click', async function () {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.guild.id);
      }
    }.bind(this));
  }

  renderJoinBtnsHTML() {
    let discordBtn = '';
    let guildBtn = '';

    if (this.guild.socials.discord_server) {
      discordBtn = `
        <a 
          href="${this.guild.socials.discord_server}" 
          class="sui-screen-btn sui-mod-secondary"
          target="_blank"
        >Join Discord</a>
      `;
    }

    if (this.guild.id !== this.gameState.thisGuild.id) {
      guildBtn = `
        <a 
          href="javascript: void(0)" 
          class="sui-screen-btn sui-mod-primary"
        >Join Guild</a>
      `;
    }

    if (discordBtn === '' && guildBtn === '') {
      return '';
    }

    return `
      <div class="sui-screen-btn-flex-wrapper">
        ${discordBtn}
        ${guildBtn}
      </div>
    `;
  }

  render () {
    this.fetchPageData().then(() => {

      MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

      MenuPage.setPageTemplateHeaderBtn('Guild Profile', true, () => {
        MenuPage.router.goto('Guild', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div class="profile-layout">
          <div class="profile-header">
            <div class="profile-header-image-container">
              <div class="profile-header-image"></div>
            </div>
            <div class="profile-header-info-container">
              <div class="profile-header-info-name sui-text-display">
                ${this.guild.name ? this.guild.name : 'Name Redacted'}
                <span class="sui-text-secondary">${this.guild.tag}</span>
              </div>
              <div class="profile-header-info-player-id">
                Guild ID #${this.guild.id}
                <a id="${this.copyGidBtnId}" href="javascript: void(0)">
                  <div class="icon-wrapper">
                    <i class="sui-icon icon-copy sui-text-secondary"></i>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Guild Data</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                ${this.guild.description ? this.guild.description : 'Description Redacted'}
              </div>
            </div>
          </div>
          
          ${this.renderJoinBtnsHTML()}
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Guild Power</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                <div>Guild Minimum</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.guildMinimumId,
                      'sui-icon-alpha-matter',
                      'Minimum alpha required to join guild',
                      this.numberFormatter.format(this.guild.join_infusion_minimum)
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Avg. Base Energy Supply</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.baseEnergySupplyId,
                      'sui-icon-energy',
                      'Average energy supplied to guild members',
                      this.numberFormatter.format(this.powerStats.avg_connection_capacity)
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Alpha Efficiency</div>
                <div>
                  ${this.numberFormatter.format(this.powerStats.ratio)} <i class="sui-icon sui-icon-md sui-icon-energy"></i> /
                  1 <i class="sui-icon sui-icon-md sui-icon-alpha-matter"></i>
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>Commission</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.commissionId,
                      'sui-icon-energy',
                      'The guild\'s cut',
                      this.powerStats.commission + '%'
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
                      'Alpha infused with the guild',
                      this.numberFormatter.format(this.powerStats.total_fuel)
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
                      'Cumulative guild member energy usage',
                      `${this.numberFormatter.format(this.powerStats.total_load)}/${this.numberFormatter.format(this.powerStats.total_capacity)}` 
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Guild Statistics</div>
            <div class="sui-data-card-body">
              <div class="sui-data-card-row">
                <div>Members</div>
                <div>${this.numberFormatter.format(this.membersCount)}</div>
              </div>
              <div class="sui-data-card-row">
                <div>Planets Completed</div>
                <div>${this.numberFormatter.format(this.completePlanetsCount)}</div>
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
