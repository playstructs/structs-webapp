import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";
import {SystemModal} from "../templates/partials/SystemModal";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {TX_STATUS} from "../../models/SigningTransaction";
import {CHAIN} from "../../constants/ChainConstants";
import {EVENTS} from "../../constants/Events";
import {protocolAtHeight, maxQueryHeight} from "../../util/ChainProtocol";
import {reactorPreview, alphaDecimal} from "../../util/ReactorState";
import {waitForReactorRefresh} from "../../util/ReactorCompletion";
import {abortableDelay} from "../../util/AbortableDelay";

export class ManageAlphaViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AlphaManager} alphaManager
   * @param {Infusion|object} infusion
   */
  constructor(
    gameState,
    guildAPI,
    alphaManager,
    infusion
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.alphaManager = alphaManager;
    this.infusion = infusion;
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();
    this.systemModal = new SystemModal();

    this.infusedAlpha = null;
    this.alphaToInfuse = null;
    this.joinInfusionMinimum = '';
    this.state = null;
    this.ready = false;
    this.loading = false;
    this.transferring = false;

    this.addBtnId = 'manage-alpha-add';
    this.subtractBtnId = 'manage-alpha-subtract';
    this.alphaInfusedId = 'manage-alpha-alpha-infused';
    this.alphaInfusedValueId = 'manage-alpha-alpha-infused-value';
    this.energyId = 'manage-alpha-energy';
    this.energyValueId = 'manage-alpha-energy-value';
    this.cancelBtnId = 'manage-alpha-cancel';
    this.saveChangesBtnId = 'manage-alpha-save-changes';

    this.infusionWarning = `Alpha will be removed from your inventory and added to the reactor.`;
    this.defusionWarning = `Alpha will be removed from the reactor and put on cooldown.`;
  }

  calculateEnergy() {
    try { return this.state ? this.numberFormatter.formatExact(reactorPreview(this.state,this.alphaToInfuse)) : ''; }
    catch { return ''; }
  }

  /**
   * The most alpha the player can have infused: what is already in the
   * reactor plus what is in their wallet.
   *
   * @return {bigint|null}
   */
  getMaxAlphaToInfuse() {
    return this.state?.maxAlpha ?? null;
  }

  canTarget(target) {
    try {
      if (!this.ready || this.transferring || this.signal?.aborted
          || this.state.protocol !== protocolAtHeight(CHAIN.ID,maxQueryHeight(this.state.height,this.gameState.currentBlockHeight || this.state.height))
          || target > this.state.maxAlpha) return false;
      reactorPreview(this.state,target);
      return true;
    } catch { return false; }
  }

  targetMeetsMinimum(target) {
    return this.state && this.state.fuel + (target-this.state.initialAlpha)*1000000n >= this.state.minimum;
  }

  async loadState() {
    if (this.loading) return;
    this.loading = true;
    const signal = this.signal;
    const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    let delay = 2000;
    try {
      while (!signal.aborted) {
        if (ownerId !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) return;
        try {
          const infusion = await this.guildAPI.getInfusionByPlayerId(ownerId,{signal,timeoutMs:5000});
          const state = await this.alphaManager.getReactorState(infusion,signal);
          signal.throwIfAborted();
          if (ownerId !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) return;
          this.infusion = infusion;
          this.state = state;
          this.infusedAlpha = state.initialAlpha;
          this.alphaToInfuse = state.initialAlpha;
          this.joinInfusionMinimum = alphaDecimal(state.minimum);
          this.ready = true;
          this.postToggleRender();
          return;
        } catch (error) {
          signal.throwIfAborted();
          console.debug('[ManageAlpha] reactor state unavailable:',error);
        }
        await abortableDelay(delay,signal);
        delay = Math.min(delay*2,30000);
      }
    } finally { this.loading = false; }
  }

  postToggleRender() {
    const subtractBtn = document.getElementById(this.subtractBtnId);
    const addBtn = document.getElementById(this.addBtnId);
    const alphaInfusedValue = document.getElementById(this.alphaInfusedValueId);
    const energyValue = document.getElementById(this.energyValueId);
    const errorElm = document.querySelector('.manage-alpha-error');
    const ctaBtns = document.querySelector('.manage-alpha-cta-btns');

    if (this.alphaToInfuse !== null && this.canTarget(this.alphaToInfuse+1n)) {
      addBtn.classList.remove('sui-mod-disabled');
      addBtn.disabled = false;
    } else {
      addBtn.classList.add('sui-mod-disabled');
      addBtn.disabled = true;
    }

    if (this.alphaToInfuse !== null && this.canTarget(this.alphaToInfuse-1n) && this.targetMeetsMinimum(this.alphaToInfuse-1n)) {
      subtractBtn.classList.remove('sui-mod-disabled');
      subtractBtn.disabled = false;
    } else {
      subtractBtn.classList.add('sui-mod-disabled');
      subtractBtn.disabled = true;
    }

    if (
      this.alphaToInfuse !== this.infusedAlpha
      && this.canTarget(this.alphaToInfuse) && this.targetMeetsMinimum(this.alphaToInfuse)
    ) {
      ctaBtns.classList.remove('hidden');
    } else {
      ctaBtns.classList.add('hidden');
    }

    if (this.ready && this.state.fuel+(this.alphaToInfuse-this.state.initialAlpha)*1000000n <= this.state.minimum) {
      errorElm.classList.remove('hidden');
    } else {
      errorElm.classList.add('hidden');
    }

    document.querySelector('.manage-alpha-error span').innerText = `The Guild Minimum is ${this.joinInfusionMinimum} Alpha Matter.`;
    alphaInfusedValue.innerText = this.alphaToInfuse?.toString() ?? '';
    energyValue.innerHTML = `${this.calculateEnergy()}`;
  }

  async save() {
    if (!this.canTarget(this.alphaToInfuse) || !this.targetMeetsMinimum(this.alphaToInfuse)
        || this.alphaToInfuse === this.infusedAlpha) return;
    this.transferring = true;
    const state = this.state;
    const delta = this.alphaToInfuse-this.infusedAlpha;
    const direction = delta > 0n ? 'infuse' : 'defuse';
    const amount = delta > 0n ? delta : -delta;
    const account = this.gameState.signingAccount.address;
    const options = new MenuWaitingOptions();
    options.navItemId = MenuPage.navItemGuildId;
    options.hasDoNotCloseMessage = false;
    options.headerBtnLabel = direction === 'infuse' ? 'Infusing...' : 'Defusing...';
    options.waitingAnimation = direction === 'infuse' ? 'INFUSE' : 'DEFUSE';
    MenuPage.router.goto('Generic','menuWaiting',options,{replace:true});
    const signal = MenuPage.router.navigationSignal;
    const active = () => !signal.aborted && account === this.gameState.signingAccount?.address
      && state.ownerId === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const returnToManage = () => {
      if (active()) MenuPage.router.goto('Guild','manageAlpha',this.infusion,{replace:true});
    };
    let tx;
    try { tx = await this.alphaManager[direction](amount,state,signal); }
    catch (error) {
      if (active()) { console.warn('[ManageAlpha] reactor change unavailable:',error); returnToManage(); }
      return;
    }
    if (!active()) return;
    if (tx.status === TX_STATUS.DROPPED || tx.status === TX_STATUS.CANCELLED) { returnToManage(); return; }
    if (tx.status !== TX_STATUS.SUCCEEDED) return;
    try {
      const refreshed = await waitForReactorRefresh(this.guildAPI,tx,signal,()=>this.gameState.currentBlockHeight);
      if (!active()) return;
      const keyPlayer = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
      const currentHeight = keyPlayer.player?.snapshot_meta?.height;
      if (!currentHeight || BigInt(refreshed.player.snapshot_meta.height) >= BigInt(currentHeight)) keyPlayer.setPlayer(refreshed.player);
      MenuPage.router.goto('Guild','reactor',{}, {replace:true});
    } catch (error) {
      if (active()) console.warn('[ManageAlpha] committed change needs indexed evidence:',error);
    }
  }

  initPageCode() {
    this.systemModal.init();
    this.signal = MenuPage.router.navigationSignal;

    document.getElementById(this.subtractBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if (this.alphaToInfuse !== null && this.canTarget(this.alphaToInfuse-1n) && this.targetMeetsMinimum(this.alphaToInfuse-1n)) {
        this.alphaToInfuse--;
      }

      this.postToggleRender();
    });

    document.getElementById(this.addBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if (this.alphaToInfuse !== null && this.canTarget(this.alphaToInfuse+1n)) {
        this.alphaToInfuse++;
      }

      this.postToggleRender();
    });

    document.getElementById(this.cancelBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'reactor');
    });
    document.getElementById(this.saveChangesBtnId).addEventListener('click', () => {
      if (!this.canTarget(this.alphaToInfuse) || !this.targetMeetsMinimum(this.alphaToInfuse) || this.alphaToInfuse===this.infusedAlpha) return;

      document.getElementById(this.systemModal.messageId).innerHTML = (this.alphaToInfuse > this.infusedAlpha)
        ? this.infusionWarning
        : this.defusionWarning;

      this.systemModal.show();
    });

    this.postToggleRender();
    const refresh = () => this.loadState().catch(error=>{
      if (!this.signal.aborted) console.debug('[ManageAlpha] refresh unavailable:',error);
    });
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED,()=>{
      if (this.ready && this.state.protocol !== protocolAtHeight(CHAIN.ID,maxQueryHeight(this.state.height,this.gameState.currentBlockHeight || this.state.height))) {
        this.ready = false;
        this.systemModal.hide();
        this.postToggleRender();
        refresh();
      }
    },{signal:this.signal});
    refresh();
  }

  render () {

    this.systemModal.iconClasses = `sui-icon-alpha-matter`;
    this.systemModal.confirmBtnHandler = () => this.save();
    const modalHTML = this.systemModal.render();

    MenuPage.enablePageTemplate(MenuPage.navItemGuildId);

    MenuPage.setPageTemplateHeaderBtn('Manage Alpha', true, () => {
      MenuPage.router.goto('Guild', 'reactor');
    });

    MenuPage.setPageTemplateContent(`
      <div class="manage-alpha-layout">
        
        <div class="manage-alpha-toggle-group">
          <button id="${this.subtractBtnId}" class="sui-screen-btn sui-mod-secondary">
            <i class="sui-icon sui-icon-md icon-subtract"></i>
          </button>
          <img src="/img/reactor-64x92.png" alt="alpha reactor">
          <button id="${this.addBtnId}" class="sui-screen-btn sui-mod-secondary">
            <i class="sui-icon sui-icon-md icon-add"></i>
          </button>
        </div>
        
        <div class="manage-alpha-amounts">
          ${
            this.genericResourceComponent.renderHTML(
              this.alphaInfusedId,
              'sui-icon-alpha-matter',
              'Alpha to infuse',
              this.alphaToInfuse?.toString() ?? ''
            )
          }
          ${
            this.genericResourceComponent.renderHTML(
              this.energyId,
              'sui-icon-energy',
              'Expected energy supply',
              this.calculateEnergy()
            )
          }
        </div>
        
        <div class="manage-alpha-error">
          <i class="sui-icon sui-icon-md icon-alert sui-text-warning"></i>
          <span>The Guild Minimum is ${this.joinInfusionMinimum} Alpha Matter.</span>
        </div>
        
        <div class="manage-alpha-cta-btns hidden">
          <a href="javascript: void(0)" id="${this.cancelBtnId}" class="sui-screen-btn sui-mod-secondary">Cancel</a>
          <a href="javascript: void(0)" id="${this.saveChangesBtnId}" class="sui-screen-btn sui-mod-primary">Save Changes</a>
        </div>
        
        ${modalHTML}
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
