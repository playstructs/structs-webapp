import {AbstractViewModelComponent} from "../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../constants/Events";

export class EnergyUsageComponent extends AbstractViewModelComponent {

  constructor(gameState, elementId) {
    super(gameState);
    this.elementId = elementId;
    this.energyUsageClass = 'energy-usage';

    this.energyUsageHandler = this.energyUsageHandler.bind(this);
  }

  getEnergyUsage() {
    const load = this.gameState.thisPlayer ? this.gameState.thisPlayer.load : 0;
    const structsLoad = this.gameState.thisPlayer ? this.gameState.thisPlayer.structs_load : 0;
    const capacity = this.gameState.thisPlayer ? this.gameState.thisPlayer.capacity : 0;
    const connectionCapacity = this.gameState.thisPlayer ? this.gameState.thisPlayer.connection_capacity : 0;

    let totalLoad = load + structsLoad;
    let totalCapacity = capacity + connectionCapacity;
    totalLoad = this.numberFormatter.format(totalLoad);
    totalCapacity = this.numberFormatter.format(totalCapacity);

    return `${totalLoad}/${totalCapacity}`;
  }

  energyUsageHandler() {
    const energyUsageLinkElm = document.getElementById(this.elementId);

    if (!energyUsageLinkElm) {
      window.removeEventListener(EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
      return;
    }

    const energyUsageNumbersContainer = energyUsageLinkElm.querySelector(`.${this.energyUsageClass}`);
    energyUsageNumbersContainer.innerText = this.getEnergyUsage();
  }

  initPageCode() {
    const energyUsageLinkElm = document.getElementById(this.elementId);
    const energyUsageNumbersContainer = energyUsageLinkElm.querySelector(`.${this.energyUsageClass}`);
    energyUsageNumbersContainer.innerText = this.getEnergyUsage();

    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, this.energyUsageHandler);
  }

  renderHTML() {
    return `
      <a 
        id="${this.elementId}"
        class="sui-resource"
        href="javascript: void(0)" 
        data-sui-tooltip="Energy Supply"
        data-sui-mod-placement="bottom"
      >
        <span class="${this.energyUsageClass}"></span>
        <i class="sui-icon sui-icon-energy"></i>
      </a>
    `;
  }
}