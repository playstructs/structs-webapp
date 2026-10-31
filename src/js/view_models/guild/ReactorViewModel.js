import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {CHAIN} from "../../constants/ChainConstants";
import {exactQueryHeight, maxQueryHeight, validateSigningSnapshot} from "../../util/ChainProtocol";
import {exactAlphaAmount} from "../../util/ReactorIntent";
import {commissionAtoms} from "../../util/ReactorState";
import {abortableDelay} from "../../util/AbortableDelay";
import {EVENTS} from "../../constants/Events";
import {startupReads} from "../../managers/StartupRecovery";

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
    this.ownerId = this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER]?.id;
    this.account = this.gameState.signingAccount?.address;
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

    const [guild, infusion] = await startupReads([
      ()=>this.guildAPI.getGuild(this.guildId,{signal,timeoutMs:5000}),
      ()=>this.guildAPI.getInfusionByPlayerId(this.ownerId,{signal,timeoutMs:5000})
    ]);
    signal.throwIfAborted();
    if (!this.current(signal) || guild.id !== this.guildId || infusion.destination_id !== guild.primary_reactor_id
        || infusion.player_id !== this.ownerId) throw new Error('Reactor view identity changed');
    if (this.infusion && BigInt(exactQueryHeight(infusion.snapshot_meta?.height))
        < BigInt(exactQueryHeight(this.infusion.snapshot_meta?.height))) throw new Error('Reactor read moved backwards');
    this.guild = guild;
    this.infusion = infusion;
    this.refreshReady = true;
  }

  current(signal) {
    return !signal.aborted && this.gameState.persistenceEnabled !== false
      && this.account === this.gameState.signingAccount?.address
      && this.ownerId === this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER]?.id
      && this.guildId === this.gameState.thisGuild.id;
  }

  updateValues() {
    for (const [id,value] of [[this.alphaInfusedId,this.rawDisplay('fuel_p',1000000n)],
      [this.defusingId,this.rawDisplay('defusing_p',1000000n)],
      [this.totalSupplyId,this.rawDisplay('power_p',1000n)],[this.commissionId,this.commissionDisplay()],
      [this.guildMinimumId,this.rawDisplay('join_infusion_minimum_p',1000000n)]]) {
      document.getElementById(`${id}-value`).textContent=value;
    }
    document.getElementById(this.manageAlphaBtnId).classList.toggle('sui-mod-disabled',!this.canManage());
  }

  startRefresh(signal, {pollMs=30000,coalesceMs=100,retryMs=2000,maxRetryMs=30000} = {}) {
    let timer=null,running=false,dirty=false,retry=retryMs;
    const schedule=delay=>{
      if (!this.current(signal) || document.visibilityState==='hidden' || running || timer!==null) return;
      timer=setTimeout(()=>{timer=null;refresh();},delay);
    };
    const request=()=>{dirty=true;schedule(coalesceMs);};
    const refresh=async()=>{
      if (!this.current(signal) || document.visibilityState==='hidden') return;
      running=true;dirty=false;
      let delay=coalesceMs;
      try {
        await this.fetchPageData(signal);
        if (!this.current(signal)) return;
        this.updateValues();
        // Readable but not yet signable: keep checking, with the same backoff as a failed read.
        if (this.canManage()) retry=retryMs;
        else { dirty=true;delay=retry;retry=Math.min(retry*2,maxRetryMs); }
      } catch(error) {
        if (!this.current(signal)) return;
        this.refreshReady=false;
        document.getElementById(this.manageAlphaBtnId).classList.add('sui-mod-disabled');
        console.debug('[ReactorView] refresh unavailable:',error);
        dirty=true;delay=retry;retry=Math.min(retry*2,maxRetryMs);
      } finally {
        running=false;
        if (dirty) schedule(delay);
      }
    };
    const options={signal};
    window.addEventListener(EVENTS.ALPHA_COUNT_CHANGED,event=>{
      if (event.playerType===PLAYER_TYPES.PLAYER) request();
    },options);
    for (const name of ['focus','online',EVENTS.GRASS_CONNECTED]) window.addEventListener(name,request,options);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') request();},options);
    const poll=setInterval(request,pollMs);
    signal.addEventListener('abort',()=>{clearTimeout(timer);clearInterval(poll);},{once:true});
    if (!this.canManage()) request();
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
    if (this.refreshReady===false) return false;
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
      if (!this.current(signal)) return;

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
      this.startRefresh(signal);
    }).catch(error=>{
      if (!this.current(signal)) return;
      console.debug('[ReactorView] data unavailable:',error);
      abortableDelay(5000,signal).then(()=>this.render()).catch(()=>{});
    });
  }
}
