import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {CHAIN} from "../../constants/ChainConstants";
import {maxQueryHeight, validateSigningSnapshot} from "../../util/ChainProtocol";
import {exactAlphaAmount} from "../../util/ReactorIntent";
import {commissionAtoms} from "../../util/ReactorState";
import {abortableDelay} from "../../util/AbortableDelay";

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

  async fetchPageData(signal) {

    const [guild, infusion] = await Promise.all([
      this.guildAPI.getGuild(this.guildId,{signal,timeoutMs:5000}),
      this.guildAPI.getInfusionByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,{signal,timeoutMs:5000})
    ]);
    signal.throwIfAborted();
    if (guild.id !== this.guildId || infusion.destination_id !== guild.primary_reactor_id
        || infusion.player_id !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) throw new Error('Reactor view identity changed');
    this.guild = guild;
    this.infusion = infusion;
  }

  initPageCode() {
    const button = document.getElementById(this.manageAlphaBtnId);
    button.classList.toggle('sui-mod-disabled',!this.canManage());
    document.getElementById(this.manageAlphaBtnId).addEventListener('click', () => {
      if (!this.canManage()) return;
      MenuPage.router.goto('Guild', 'manageAlpha', this.infusion);
    });
  }

  canManage() {
    try {
      const meta = this.infusion.snapshot_meta;
      validateSigningSnapshot(meta,{chainId:CHAIN.ID,height:maxQueryHeight(meta.observed_tip,this.gameState.currentBlockHeight || meta.observed_tip)},['inventory']);
      return true;
    } catch { return false; }
  }

  rawDisplay(field, scale) {
    const value = this.infusion[field];
    return value === null || value === undefined ? '' : this.numberFormatter.formatExact(exactAlphaAmount(value)/scale);
  }

  commissionDisplay() {
    const commission = this.infusion.preview_commission ?? this.guild.default_commission;
    return `${commissionAtoms(commission)*100n/1000000000000000000n}%`;
  }

  render () {
    const signal = MenuPage.router.navigationSignal;
    this.fetchPageData(signal).then(() => {
      if (signal.aborted) return;

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
                          this.rawDisplay('fuel_p',1000000n)
                        )
                      }
                    </div>
                  </div>
                  <div class="sui-data-card-row">
                    <div class="sui-text-hint">
                      Cooldown
                      <a 
                        id="cooldown-tip"
                        class="sui-text-secondary"
                        href="javascript: void(0)" 
                        data-sui-tooltip="When removed from a Reactor, Alpha Matter must cool down before use."
                        data-sui-mod-placement="bottom"
                      >
                        <i class="sui-icon icon-tip"></i>
                      </a>
                    </div>
                    <div>
                      ${
                        this.genericResourceComponent.renderHTML(
                          this.defusingId,
                          'sui-icon-inert-alpha',
                          'Alpha removed from the reactor that must cooldown before reuse',
                          this.rawDisplay('defusing_p',1000000n)
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
                          this.rawDisplay('power_p',1000n)
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
                <div>
                  Guild Minimum
                  <a 
                    id="guild-minimum-tip"
                    class="sui-text-secondary"
                    href="javascript: void(0)" 
                    data-sui-tooltip="The minimum Alpha Matter that must be infused for Guild Membership."
                  >
                    <i class="sui-icon icon-tip"></i>
                  </a>
                </div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.guildMinimumId,
                      'sui-icon-alpha-matter',
                      'Minimum alpha required to join guild',
                      this.rawDisplay('join_infusion_minimum_p',1000000n)
                    )
                  }
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>
                  Reactor Efficiency
                  <a 
                    id="reactor-efficiency-tip"
                    class="sui-text-secondary"
                    href="javascript: void(0)" 
                    data-sui-tooltip="The amount of Energy supplied for each additional Alpha Matter infused."
                  >
                    <i class="sui-icon icon-tip"></i>
                  </a>
                </div>
                <div>
                  ${this.numberFormatter.format(this.guild.reactor_ratio)} <i class="sui-icon sui-icon-md sui-icon-energy"></i> /
                  1 <i class="sui-icon sui-icon-md sui-icon-alpha-matter"></i>
                </div>
              </div>
              <div class="sui-data-card-row">
                <div>
                  Commission
                  <a 
                    id="commission-tip"
                    class="sui-text-secondary"
                    href="javascript: void(0)" 
                    data-sui-tooltip="The percentage of Energy taken by the guild."
                  >
                    <i class="sui-icon icon-tip"></i>
                  </a>
                </div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.commissionId,
                      'sui-icon-energy',
                      'The guild\'s cut',
                      this.commissionDisplay()
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
      if (!this.canManage()) return abortableDelay(2000,signal).then(()=>this.render());
    }).catch(error=>{
      if (signal.aborted) return;
      console.debug('[ReactorView] data unavailable:',error);
      abortableDelay(5000,signal).then(()=>this.render()).catch(()=>{});
    });
  }
}
