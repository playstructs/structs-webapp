import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {SystemModal} from "../templates/partials/SystemModal";
import {AlphaInfusedChangeListener} from "../../grass_listeners/AlphaInfusedChangeListener";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {
  fmt,
  mulRational,
  parseDecimalRational,
} from "../../util/Units";

const GRAM = 1000000n;

export class ManageAlphaViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {AlphaManager} alphaManager
   * @param {Infusion|object} infusion
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    alphaManager,
    infusion
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.alphaManager = alphaManager;
    this.infusion = infusion;
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.systemModal = new SystemModal();

    this.fuelP = infusion.fuel_p ?? 0n;
    this.alphaToInfuse = this.fuelP;
    this.joinInfusionMinimum = infusion.join_infusion_minimum_p
      ?? this.gameState.thisGuild.join_infusion_minimum_p
      ?? 0n;

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

  /**
   * Player's personal capacity from target fuel: ratio × fuel × (1 − commission).
   * @return {bigint} milliwatts
   */
  calculateEnergy() {
    const ratio = this.infusion.ratio_p
      ?? (this.gameState.thisGuild.reactor_ratio != null
        ? BigInt(Math.round(Number(this.gameState.thisGuild.reactor_ratio)))
        : 1n);
    const power = ratio * this.alphaToInfuse;
    const commission = parseDecimalRational(
      this.infusion.commission ?? this.gameState.thisGuild.default_commission ?? '0'
    ) ?? {num: 0n, den: 1n};
    const keep = {num: commission.den - commission.num, den: commission.den};
    return mulRational(power, keep);
  }

  walletAlphaP() {
    return this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player?.alpha_p ?? 0n;
  }

  postToggleRender() {
    const subtractBtn = document.getElementById(this.subtractBtnId);
    const addBtn = document.getElementById(this.addBtnId);
    const alphaInfusedValue = document.getElementById(this.alphaInfusedValueId);
    const energyValue = document.getElementById(this.energyValueId);
    const errorElm = document.querySelector('.manage-alpha-error');
    const ctaBtns = document.querySelector('.manage-alpha-cta-btns');

    const neededFromWallet = this.alphaToInfuse > this.fuelP
      ? this.alphaToInfuse - this.fuelP
      : 0n;

    // Add enabled while one more gram from the wallet still fits.
    if ((neededFromWallet + GRAM) <= this.walletAlphaP()) {
      addBtn.classList.remove('sui-mod-disabled');
      addBtn.disabled = false;
    } else {
      addBtn.classList.add('sui-mod-disabled');
      addBtn.disabled = true;
    }

    if (this.alphaToInfuse > this.joinInfusionMinimum) {
      subtractBtn.classList.remove('sui-mod-disabled');
      subtractBtn.disabled = false;
    } else {
      subtractBtn.classList.add('sui-mod-disabled');
      subtractBtn.disabled = true;
    }

    if (
      this.alphaToInfuse !== this.fuelP
      && this.alphaToInfuse >= this.joinInfusionMinimum
    ) {
      ctaBtns.classList.remove('hidden');
    } else {
      ctaBtns.classList.add('hidden');
    }

    if (this.alphaToInfuse < this.joinInfusionMinimum) {
      errorElm.classList.remove('hidden');
    } else {
      errorElm.classList.add('hidden');
    }

    alphaInfusedValue.innerText = fmt(this.alphaToInfuse, 'ualpha');
    energyValue.innerHTML = fmt(this.calculateEnergy(), 'mw');
  }

  async infuse() {
    const alphaDiff = this.alphaToInfuse - this.fuelP;
    if (alphaDiff <= 0n) {
      return;
    }
    this.grassManager.registerListener(new AlphaInfusedChangeListener(this.gameState, this.guildAPI, 'infused'));
    try {
      const tx = await this.alphaManager.infuse(alphaDiff);
      if (!this.alphaManager.isSettledSuccess(tx)) {
        console.error('Infuse failed', tx?.error);
        MenuPage.router.goto('Guild', 'manageAlpha');
      }
    } catch (err) {
      console.error('Infuse error', err);
      MenuPage.router.goto('Guild', 'manageAlpha');
    }
  }

  async defuse() {
    const alphaDiff = this.fuelP - this.alphaToInfuse;
    if (alphaDiff <= 0n) {
      return;
    }
    this.grassManager.registerListener(new AlphaInfusedChangeListener(this.gameState, this.guildAPI, 'defusion_started'));
    try {
      const tx = await this.alphaManager.defuse(alphaDiff);
      if (!this.alphaManager.isSettledSuccess(tx)) {
        console.error('Defuse failed', tx?.error);
        MenuPage.router.goto('Guild', 'manageAlpha');
      }
    } catch (err) {
      console.error('Defuse error', err);
      MenuPage.router.goto('Guild', 'manageAlpha');
    }
  }

  initPageCode() {
    this.systemModal.init();

    document.getElementById(this.subtractBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if (this.alphaToInfuse > this.joinInfusionMinimum) {
        const next = this.alphaToInfuse - GRAM;
        this.alphaToInfuse = next < this.joinInfusionMinimum ? this.joinInfusionMinimum : next;
      }

      this.postToggleRender();
    });

    document.getElementById(this.addBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if ((this.alphaToInfuse - this.fuelP + GRAM) <= this.walletAlphaP()) {
        this.alphaToInfuse += GRAM;
      }

      this.postToggleRender();
    });

    document.getElementById(this.cancelBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'reactor');
    });
    document.getElementById(this.saveChangesBtnId).addEventListener('click', () => {
      if (this.alphaToInfuse === this.fuelP) {
        return;
      }

      document.getElementById(this.systemModal.messageId).innerHTML = (this.alphaToInfuse > this.fuelP)
        ? this.infusionWarning
        : this.defusionWarning;

      this.systemModal.show();
    });

    this.postToggleRender();
  }

  render () {

    this.systemModal.iconClasses = `sui-icon-alpha-matter`;
    this.systemModal.confirmBtnHandler = () => {
      const options = new MenuWaitingOptions();
      options.navItemId = MenuPage.navItemGuildId;
      options.hasDoNotCloseMessage = false;

      if (this.alphaToInfuse > this.fuelP) {
        this.infuse();

        options.headerBtnLabel = 'Infusing...';
        options.waitingAnimation = 'INFUSE';
      } else if (this.alphaToInfuse < this.fuelP) {
        this.defuse();

        options.headerBtnLabel = 'Defusing...';
        options.waitingAnimation = 'DEFUSE';
      } else {
        return;
      }

      MenuPage.router.goto('Generic', 'menuWaiting', options);
    };
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
              fmt(this.fuelP, 'ualpha')
            )
          }
          ${
            this.genericResourceComponent.renderHTML(
              this.energyId,
              'sui-icon-energy',
              'Expected energy supply',
              fmt(this.calculateEnergy(), 'mw')
            )
          }
        </div>
        
        <div class="manage-alpha-error">
          <i class="sui-icon sui-icon-md icon-alert sui-text-warning"></i>
          <span>The Guild Minimum is ${fmt(this.joinInfusionMinimum, 'ualpha')}.</span>
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
