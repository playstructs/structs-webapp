import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {GenericResourceComponent} from "./GenericResourceComponent";

export class PlanetCardComponent extends AbstractViewModelComponent {

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
    this.isFleetOnPlanet = (Boolean(isRaidCard) === Boolean(this.gameState.raidPlanetRaidInfo.isRaidActive()));
    this.planetName = '';

    this.hasStatusGroup = false;

    this.undiscoveredOre = 0;
    this.undiscoveredOreId = `${this.idPrefix}-planet-card-undiscovered-ore`;
    this.undiscoveredOreEvent = EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED;

    this.alphaOre = 0;
    this.alphaOreId = `${this.idPrefix}-planet-card-alpha-ore`;
    this.alphaOreEvent = EVENTS.ORE_COUNT_CHANGED;

    this.shieldHealth = 0;
    this.shieldHealthId = `${this.idPrefix}-planet-card-shield-health`;
    this.shieldHealthEvent = EVENTS.SHIELD_HEALTH_CHANGED;

    this.deployedStructs = 'TODO';
    this.deployedStructsId = `${this.idPrefix}-planet-card-deployed-structs`;
    this.deployedStructsEvent = "";

    this.undiscoveredOreUpdateHandler = () => {};
    this.alphaOreUpdateHandler = () => {};
    this.shieldHealthUpdateHandler = () => {};
    this.deployedStructsUpdateHandler = () => {};

    this.hasAlert = false;
    this.alertIconClass = "icon-alert";
    this.alertMessage = "";

    this.hasGeneralMessage = false;
    this.generalMessageIconClass = "icon-raid";
    this.generalMessage = "";

    this.hasPrimaryBtn = false;
    this.primaryBtnId = `${this.idPrefix}-planet-card-primary-btn`;
    this.primaryBtnLabel = "";
    this.primaryBtnHandler = () => {};

    this.hasSecondaryBtn = false;
    this.secondaryBtnId = `${this.idPrefix}-planet-card-secondary-btn`;
    this.secondaryBtnLabel = "";
    this.secondaryBtnHandler = () => {};

    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.undiscoveredOreId),
      this.genericResourceComponent.getPageCode(this.alphaOreId),
      this.genericResourceComponent.getPageCode(this.shieldHealthId),
      this.genericResourceComponent.getPageCode(this.deployedStructsId)
    ];
  }

  initPageCode() {

    if (this.hasStatusGroup) {

      for (let i = 0; i < this.genericResourcePageCode.length; i++) {
        this.genericResourcePageCode[i]();
      }

      window.addEventListener(this.undiscoveredOreEvent, this.undiscoveredOreUpdateHandler.bind(this));
      window.addEventListener(this.alphaOreEvent, this.alphaOreUpdateHandler.bind(this));
      window.addEventListener(this.shieldHealthEvent, this.shieldHealthUpdateHandler.bind(this));
      window.addEventListener(this.deployedStructsEvent, this.deployedStructsUpdateHandler.bind(this));
    }

    if (this.hasPrimaryBtn) {
      document.getElementById(this.primaryBtnId).addEventListener('click', this.primaryBtnHandler.bind(this));
    }

    if (this.hasSecondaryBtn) {
      document.getElementById(this.secondaryBtnId).addEventListener('click', this.secondaryBtnHandler.bind(this));
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
          ${
            this.genericResourceComponent.renderHTML(
              this.shieldHealthId,
              this.isRaidCard ? 'sui-icon-enemy-shield-health' : 'sui-icon-shield-health',
              'Planetary Shield',
              this.shieldHealth + "%",
              true
            )
          }
          
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
        <i class="sui-icon sui-icon-lg ${this.alertIconClass} sui-text-warning"></i>
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

  renderPrimaryBtnHTML() {
    if (!this.hasPrimaryBtn) {
      return '';
    }

    return `
      <a 
        href="javascript: void(0)"
        id="${this.primaryBtnId}"
        class="sui-screen-btn sui-mod-primary"
      >${this.primaryBtnLabel}</a>
    `;
  }

  renderSecondaryBtnHTML() {
    if (!this.hasSecondaryBtn) {
      return '';
    }

    return `
      <a 
        href="javascript: void(0)"
        id="${this.secondaryBtnId}" 
        class="sui-screen-btn sui-mod-secondary"
      >${this.secondaryBtnLabel}</a>
    `;
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