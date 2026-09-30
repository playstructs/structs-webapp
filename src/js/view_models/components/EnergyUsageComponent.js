import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {fmtSet} from "../../util/Units";

export class EnergyUsageComponent extends AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.textClassEnergyInsufficient = 'sui-text-warning';
    this.cheatsheetEnergySufficient = 'energy-supply-sufficient';
    this.cheatsheetEnergyInsufficient = 'energy-supply-insufficient';
    this.iconEnergySufficient = 'sui-icon-energy';
    this.iconEnergyInsufficient = 'sui-icon-energy-insufficient';

    this.energyUsageHandler = this.energyUsageHandler.bind(this);
  }

  getEnergyUsage() {
    const player = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player;
    if (!player) {
      return '—/—';
    }

    const totalLoad = (player.load_p ?? 0n) + (player.structs_load_p ?? 0n);
    const totalCapacity = (player.capacity_p ?? 0n) + (player.connection_capacity_p ?? 0n);
    const [loadStr, capStr] = fmtSet([totalLoad, totalCapacity], 'mw');

    return `${loadStr}/${capStr}`;
  }

  /**
   * @return {boolean}
   */
  isPlayerOverloaded() {
    const player = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player;
    return !!player && player.isOverloaded();
  }

  /**
   * @param {HTMLElement} energyUsageLinkElm
   */
  renderEnergyUsage(energyUsageLinkElm) {
    const energyUsageNumbersElm = energyUsageLinkElm.querySelector('span');
    const energyUsageIconElm = energyUsageLinkElm.querySelector('i');
    const isOverloaded = this.isPlayerOverloaded();

    energyUsageLinkElm.dataset.suiCheatsheet = isOverloaded
      ? this.cheatsheetEnergyInsufficient
      : this.cheatsheetEnergySufficient;

    energyUsageNumbersElm.classList.toggle(this.textClassEnergyInsufficient, isOverloaded);
    energyUsageIconElm.classList.toggle(this.iconEnergyInsufficient, isOverloaded);
    energyUsageIconElm.classList.toggle(this.iconEnergySufficient, !isOverloaded);

    energyUsageNumbersElm.innerText = this.getEnergyUsage();
  }

  energyUsageHandler(event) {
    if (event.playerType !== PLAYER_TYPES.PLAYER) {
      return;
    }

    const energyUsageLinkElm = document.getElementById(this.elementId);

    if (!energyUsageLinkElm) {
      window.removeEventListener(EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
      return;
    }

    this.renderEnergyUsage(energyUsageLinkElm);
  }

  initPageCode() {
    this.renderEnergyUsage(document.getElementById(this.elementId));

    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
  }

  renderHTML() {
    let cheatsheet = this.cheatsheetEnergySufficient;
    let icon = this.iconEnergySufficient;
    let textClass = '';

    if (this.isPlayerOverloaded()) {
      cheatsheet = this.cheatsheetEnergyInsufficient;
      icon = this.iconEnergyInsufficient;
      textClass = this.textClassEnergyInsufficient;
    }

    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-cheatsheet="${cheatsheet}"
      >
        <span class="${textClass}"></span>
        <i class="sui-icon ${icon}"></i>
      </a>
    `;
  }
}