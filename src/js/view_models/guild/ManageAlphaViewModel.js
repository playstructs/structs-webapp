import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {GenericResourceComponent} from "../components/GenericResourceComponent";
import {NumberFormatter} from "../../util/NumberFormatter";
import {SystemModal} from "../templates/partials/SystemModal";

export class ManageAlphaViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {Infusion|object} infusion
   */
  constructor(
    gameState,
    guildAPI,
    infusion
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.infusion = infusion;
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();
    this.systemModal = new SystemModal();

    this.alphaToInfuse = this.infusion.fuel;
    this.joinInfusionMinimum = this.gameState.thisGuild.join_infusion_minimum;

    this.addBtnId = 'manage-alpha-add';
    this.subtractBtnId = 'manage-alpha-subtract';
    this.alphaInfusedId = 'manage-alpha-alpha-infused';
    this.alphaInfusedValueId = 'manage-alpha-alpha-infused-value';
    this.energyId = 'manage-alpha-energy';
    this.energyValueId = 'manage-alpha-energy-value';
    this.cancelBtnId = 'manage-alpha-cancel';
    this.saveChangesBtnId = 'manage-alpha-save-changes';

    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.alphaInfusedId),
      this.genericResourceComponent.getPageCode(this.energyId),
    ];
  }

  calculateEnergy() {
    return Math.floor(this.alphaToInfuse * this.gameState.thisGuild.reactor_ratio * (1 - this.gameState.thisGuild.default_commission));
  }

  postToggleRender() {
    const subtractBtn = document.getElementById(this.subtractBtnId);
    const addBtn = document.getElementById(this.addBtnId);
    const alphaInfusedValue = document.getElementById(this.alphaInfusedValueId);
    const energyValue = document.getElementById(this.energyValueId);
    const errorElm = document.querySelector('.manage-alpha-error');
    const ctaBtns = document.querySelector('.manage-alpha-cta-btns');

    if (this.alphaToInfuse < this.gameState.thisPlayer.alpha) {
      addBtn.classList.remove('sui-mod-disabled');
      addBtn.disabled = false;
    } else {
      addBtn.classList.add('sui-mod-disabled');
      addBtn.disabled = true;
    }

    if (this.alphaToInfuse > 0 && this.alphaToInfuse > this.joinInfusionMinimum) {
      subtractBtn.classList.remove('sui-mod-disabled');
      subtractBtn.disabled = false;
    } else {
      subtractBtn.classList.add('sui-mod-disabled');
      subtractBtn.disabled = true;
    }

    if (
      this.alphaToInfuse !== this.gameState.thisPlayer.alpha
      && this.alphaToInfuse >= this.joinInfusionMinimum
    ) {
      ctaBtns.classList.remove('hidden');
    } else {
      ctaBtns.classList.add('hidden');
    }

    if (this.alphaToInfuse <= this.joinInfusionMinimum) {
      errorElm.classList.remove('hidden');
    } else {
      errorElm.classList.add('hidden');
    }

    alphaInfusedValue.innerText = this.alphaToInfuse;
    energyValue.innerHTML = `${this.calculateEnergy()}`;
  }

  initPageCode() {
    this.systemModal.init();

    for (let i = 0; i < this.genericResourcePageCode.length; i++) {
      this.genericResourcePageCode[i]();
    }

    document.getElementById(this.subtractBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if (this.alphaToInfuse > 0 && this.alphaToInfuse > this.joinInfusionMinimum) {
        this.alphaToInfuse--;
      }

      this.postToggleRender();
    });

    document.getElementById(this.addBtnId).addEventListener('click', (event) => {
      event.preventDefault();

      if (this.alphaToInfuse < this.gameState.thisPlayer.alpha) {
        this.alphaToInfuse++;
      }

      this.postToggleRender();
    });

    document.getElementById(this.cancelBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Guild', 'reactor');
    });
    document.getElementById(this.saveChangesBtnId).addEventListener('click', () => {
      this.systemModal.show();
    });

    this.postToggleRender();
  }

  render () {

    this.systemModal.iconClasses = `sui-icon-alpha-matter`;
    this.systemModal.messageHTML = `Alpha will be removed from your inventory and added to the reactor.`;
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
              this.infusion.fuel
            )
          }
          ${
            this.genericResourceComponent.renderHTML(
              this.energyId,
              'sui-icon-energy',
              'Expected energy supply',
              this.numberFormatter.format(this.alphaToInfuse * this.infusion.ratio * (this.infusion.commission/100))
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
