import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";

export class ReactorViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(
    gameState,
    guildAPI
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.guildId = this.gameState.thisGuild.id;
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();

    this.guildMinimumId = 'guild-profile-guild-minimum';
    this.commissionId = 'guild-profile-commission';
    this.alphaInfusedId = 'guild-profile-alpha-infused';
    this.defusingId = 'guild-profile-defusing';
    this.totalSupplyId = 'guild-profile-total-supply';
    this.manageAlphaBtnId = 'guild-reactor-manage-alpha-btn';

    this.guild = null;
    this.infusion = null;
  }

  async fetchPageData() {

    const [guild, infusion] = await Promise.all([
      this.guildAPI.getGuild(this.guildId),
      this.guildAPI.getInfusionByPlayerId(this.gameState.thisPlayerId)
    ]);

    this.guild = guild;
    this.infusion = infusion;
  }

  initPageCode() {
    document.getElementById(this.manageAlphaBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'manageAlpha', this.infusion);
    });
  }

  render () {
    this.fetchPageData().then(() => {

      MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

      MenuPage.setPageTemplateHeaderBtn('Guild Reactor', true, () => {
        MenuPage.router.goto('Guild', 'index');
      });

      MenuPage.setPageTemplateContent(`
        <div class="profile-layout">
        
          <div class="guild-reactor-section">
          
            <img class="guild-reactor-img" src="/img/reactor-64x92.png" alt="alpha reactor">
            
            <div class="guild-reactor-section-right">
            
              <div class="guild-reactor-info-group">
                <div class="sui-text-header sui-text-secondary">ALPHA MATTER</div>
                <div class="guild-reactor-info-rows">
                    
                  <div class="sui-data-card-row">
                    <div class="sui-text-hint">Alpha Infused</div>
                    <div>
                      ${
                        this.genericResourceComponent.renderHTML(
                          this.alphaInfusedId,
                          'sui-icon-alpha-matter',
                          'Alpha infused with the guild',
                          this.numberFormatter.format(this.infusion.fuel)
                        )
                      }
                    </div>
                  </div>
                  <div class="sui-data-card-row">
                    <div class="sui-text-hint">Cooldown</div>
                    <div>
                      ${
                        this.genericResourceComponent.renderHTML(
                          this.defusingId,
                          'sui-icon-inert-alpha',
                          'Alpha removed from the reactor that must cooldown before reuse',
                          this.numberFormatter.format(this.infusion.defusing)
                        )
                      }
                    </div>
                  </div>
                    
                </div>
              </div>
              
              <div class="guild-reactor-info-group">
                <div class="sui-text-header sui-text-secondary">ENERGY</div>
                <div class="guild-reactor-info-rows">
                    
                  <div class="sui-data-card-row">
                    <div class="sui-text-hint">Total Supply</div>
                    <div>
                      ${
                        this.genericResourceComponent.renderHTML(
                          this.totalSupplyId,
                          'sui-icon-energy',
                          'Expected supply of power',
                          this.numberFormatter.format(this.infusion.power)
                        )
                      }
                    </div>
                  </div>
                    
                </div>
              </div>
              
              <div class="sui-screen-btn-flex-wrapper">
                <a 
                  href="javascript: void(0)" 
                  id="${this.manageAlphaBtnId}" 
                  class="sui-screen-btn sui-mod-primary"
                >Manage Alpha</a>
              </div>
              
            </div>
          
          </div>
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Reactor Details</div>
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
                <div>Reactor Efficiency</div>
                <div>
                  ${this.numberFormatter.format(this.guild.reactor_ratio)} <i class="sui-icon sui-icon-md sui-icon-energy"></i> /
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
                      Math.floor(this.guild.default_commission * 100) + '%'
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
