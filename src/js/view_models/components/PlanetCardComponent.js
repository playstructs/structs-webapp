import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {GenericResourceComponent} from "./GenericResourceComponent";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {ShieldStatusComponent} from "./ShieldStatusComponent";

export class PlanetCardComponent extends AbstractViewModelComponent {

  /**
   * Tracks the energy listener of each card, so that the card taking its place,
   * which reuses the button ids, can remove it.
   *
   * @type {Object<string, function>}
   */
  static energyUsageHandlers = {};

  /**
   * @param {GameState} gameState
   * @param {string} idPrefix
   * @param {boolean} isRaidCard
   */
  constructor(
    gameState,
    idPrefix,
    isRaidCard
  ) {
    super(gameState);
    this.genericResourceComponent = new GenericResourceComponent(gameState);

    this.idPrefix = idPrefix;
    this.isRaidCard = isRaidCard;
    this.isFleetOnPlanet = (Boolean(isRaidCard) === Boolean(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()));
    this.planetName = '';

    this.hasStatusGroup = false;

    this.undiscoveredOre = 0;
    this.undiscoveredOreId = `${this.idPrefix}-planet-card-undiscovered-ore`;
    this.undiscoveredOreEvent = EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED;

    this.alphaOre = 0;
    this.alphaOreId = `${this.idPrefix}-planet-card-alpha-ore`;
    this.alphaOreEvent = EVENTS.ORE_COUNT_CHANGED;

    this.shieldHealthId = `${this.idPrefix}-planet-card-shield-health`;
    this.shieldStatusComponent = new ShieldStatusComponent(
      this.gameState,
      this.isRaidCard ? PLAYER_TYPES.RAID_ENEMY : PLAYER_TYPES.PLAYER,
      this.shieldHealthId,
      true
    );

    this.deployedStructs = '0+0';
    this.deployedStructsId = `${this.idPrefix}-planet-card-deployed-structs`;
    this.deployedStructsEvent = EVENTS.STRUCT_COUNT_CHANGED;

    this.undiscoveredOreUpdateHandler = () => {};
    this.alphaOreUpdateHandler = () => {};
    this.deployedStructsUpdateHandler = () => {};

    this.hasAlert = false;
    this.alertIconClass = "icon-alert";
    this.alertIconColorClass = "sui-text-warning";
    this.alertMessage = "";

    this.hasGeneralMessage = false;
    this.generalMessageIconClass = "icon-raid";
    this.generalMessage = "";

    this.hasPrimaryBtn = false;
    this.primaryBtnId = `${this.idPrefix}-planet-card-primary-btn`;
    this.primaryBtnLabel = "";
    this.primaryBtnHandler = () => {};
    this.primaryBtnRequiresEnergy = false;

    this.hasSecondaryBtn = false;
    this.secondaryBtnId = `${this.idPrefix}-planet-card-secondary-btn`;
    this.secondaryBtnLabel = "";
    this.secondaryBtnHandler = () => {};
    this.secondaryBtnRequiresEnergy = false;

    this.insufficientEnergyTooltip = '';
  }

  initPageCode() {

    if (this.hasStatusGroup) {
      window.addEventListener(this.undiscoveredOreEvent, this.undiscoveredOreUpdateHandler.bind(this));
      window.addEventListener(this.alphaOreEvent, this.alphaOreUpdateHandler.bind(this));
      window.addEventListener(this.deployedStructsEvent, this.deployedStructsUpdateHandler.bind(this));
      this.shieldStatusComponent.initPageCode();
    }

    if (this.hasPrimaryBtn) {
      this.initBtn(this.primaryBtnId, this.primaryBtnHandler, this.primaryBtnRequiresEnergy);
    }

    if (this.hasSecondaryBtn) {
      this.initBtn(this.secondaryBtnId, this.secondaryBtnHandler, this.secondaryBtnRequiresEnergy);
    }

    this.initEnergyUsageListener();
  }

  /**
   * @param {string} btnId
   * @param {function} handler
   * @param {boolean} requiresEnergy
   */
  initBtn(btnId, handler, requiresEnergy) {
    document.getElementById(btnId).addEventListener('click', (event) => {
      if (!this.isBtnDisabled(requiresEnergy)) {
        handler.call(this, event);
      }
    });
  }

  initEnergyUsageListener() {
    window.removeEventListener(EVENTS.ENERGY_USAGE_CHANGED, PlanetCardComponent.energyUsageHandlers[this.idPrefix]);
    delete PlanetCardComponent.energyUsageHandlers[this.idPrefix];

    if (!this.primaryBtnRequiresEnergy && !this.secondaryBtnRequiresEnergy) {
      return;
    }

    PlanetCardComponent.energyUsageHandlers[this.idPrefix] = (event) => {
      if (event.playerType !== PLAYER_TYPES.PLAYER) {
        return;
      }

      if (this.primaryBtnRequiresEnergy) {
        this.updateBtn(this.primaryBtnId, 'sui-mod-primary');
      }

      if (this.secondaryBtnRequiresEnergy) {
        this.updateBtn(this.secondaryBtnId, 'sui-mod-secondary');
      }
    };

    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, PlanetCardComponent.energyUsageHandlers[this.idPrefix]);
  }

  /**
   * @param {boolean} requiresEnergy
   * @return {boolean}
   */
  isBtnDisabled(requiresEnergy) {
    return requiresEnergy && !!this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player?.isOverloaded();
  }

  /**
   * Disabled replaces the type class, otherwise its hover colors would still apply.
   *
   * @param {string} btnId
   * @param {string} typeClass
   */
  updateBtn(btnId, typeClass) {
    const btnElm = document.getElementById(btnId);

    if (!btnElm) {
      return;
    }

    const isDisabled = this.isBtnDisabled(true);

    btnElm.classList.toggle('sui-mod-disabled', isDisabled);
    btnElm.classList.toggle(typeClass, !isDisabled);

    if (isDisabled) {
      btnElm.dataset.suiTooltip = this.insufficientEnergyTooltip;
    } else {
      delete btnElm.dataset.suiTooltip;
    }
  }

  renderFleetBadgeHTML() {
    if (!this.isFleetOnPlanet) {
      return '';
    }

    return `<span class="sui-badge sui-mod-solid">Fleet</span>`;
  }

  renderPlanetNameHTML() {
    if (!this.planetName) {
      return '';
    }

    return `<span>${this.planetName}</span>`;
  }

  renderStatusGroupHTML() {
    if (!this.hasStatusGroup) {
      return '';
    }

    return `
      <div class="sui-planet-card-status-group">
        <div class="sui-planet-card-status-group-col">
          ${
            this.genericResourceComponent.renderHTML(
              this.undiscoveredOreId,
              'sui-icon-undiscovered-ore',
              'Undiscovered Ore',
              this.numberFormatter.format(this.undiscoveredOre),
              true
            )
          }

          ${
            this.genericResourceComponent.renderHTML(
              this.alphaOreId,
              'sui-icon-alpha-ore',
              'Alpha Ore',
              this.numberFormatter.format(this.alphaOre),
              true
            )
          }
        </div>
        <div class="sui-planet-card-status-group-col">
          ${this.shieldStatusComponent.renderHTML()}
          
          ${
            this.genericResourceComponent.renderHTML(
              this.deployedStructsId,
              this.isRaidCard ? 'sui-icon-enemy-deployed-structs' : 'sui-icon-deployed-structs',
              'Fleet+Planetary Structs',
              this.deployedStructs,
              true
            )
          }
        </div>
      </div>
    `;
  }

  renderAlertHTML() {
    if (!this.hasAlert) {
      return '';
    }

    return `
      <div class="sui-planet-card-alert">
        <i class="sui-icon sui-icon-lg ${this.alertIconClass} ${this.alertIconColorClass}"></i>
        ${this.alertMessage}
      </div>
    `;
  }

  renderGeneralMessageHTML() {
    if (!this.hasGeneralMessage) {
      return '';
    }

    return `
      <div class="sui-planet-card-message">
        <i class="sui-icon sui-icon-xl ${this.generalMessageIconClass} sui-text-primary"></i>
        ${this.generalMessage}
      </div>
    `;
  }

  /**
   * @param {string} btnId
   * @param {string} label
   * @param {string} typeClass
   * @param {boolean} requiresEnergy
   * @return {string}
   */
  renderBtnHTML(btnId, label, typeClass, requiresEnergy) {
    const isDisabled = this.isBtnDisabled(requiresEnergy);

    return `
      <a
        href="javascript: void(0)"
        id="${btnId}"
        class="sui-screen-btn ${isDisabled ? 'sui-mod-disabled' : typeClass}"
        ${isDisabled ? `data-sui-tooltip="${this.insufficientEnergyTooltip}"` : ''}
      >${label}</a>
    `;
  }

  renderPrimaryBtnHTML() {
    if (!this.hasPrimaryBtn) {
      return '';
    }

    return this.renderBtnHTML(
      this.primaryBtnId,
      this.primaryBtnLabel,
      'sui-mod-primary',
      this.primaryBtnRequiresEnergy
    );
  }

  renderSecondaryBtnHTML() {
    if (!this.hasSecondaryBtn) {
      return '';
    }

    return this.renderBtnHTML(
      this.secondaryBtnId,
      this.secondaryBtnLabel,
      'sui-mod-secondary',
      this.secondaryBtnRequiresEnergy
    );
  }

  renderHTML() {

    const cardIconClass = this.isRaidCard ? "icon-raid" : "icon-planet";

    const cardTitle = this.isRaidCard ? "Raid" : "Alpha Base";

    return `
      <div class="sui-planet-card">

        <div class="sui-planet-card-header">
          <div class="sui-planet-card-header-label">
            <i class="sui-icon sui-icon-md ${cardIconClass}"></i>
            <div class="sui-planet-card-header-label-title">
              <span>
                ${cardTitle}
              </span>
              ${this.renderPlanetNameHTML()}
            </div>
          </div>

          ${this.renderFleetBadgeHTML()}
        </div>


        <div class="sui-planet-card-body">
          <div class="sui-planet-card-body-content">
            
            ${this.renderStatusGroupHTML()}

            ${this.renderAlertHTML()}

            ${this.renderGeneralMessageHTML()}
            
          </div>

          <div class="sui-screen-btn-flex-wrapper">
          
            ${this.renderSecondaryBtnHTML()}
            
            ${this.renderPrimaryBtnHTML()}
            
          </div>
        </div>

      </div>
    `;
  }
}