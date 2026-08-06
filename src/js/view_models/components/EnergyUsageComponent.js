import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

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
    const load = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.load : 0;
    const structsLoad = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.structs_load : 0;
    const capacity = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.capacity : 0;
    const connectionCapacity = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player ? this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.connection_capacity : 0;

    let totalLoad = load + structsLoad;
    let totalCapacity = capacity + connectionCapacity;
    totalLoad = this.numberFormatter.format(totalLoad);
    totalCapacity = this.numberFormatter.format(totalCapacity);

    return `${totalLoad}/${totalCapacity}`;
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