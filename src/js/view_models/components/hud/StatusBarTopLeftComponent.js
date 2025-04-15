import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EnergyUsageComponent} from "../EnergyUsageComponent";

export class StatusBarTopLeftComponent extends AbstractViewModelComponent {

  constructor(gameState) {
    super(gameState);
    this.energyUsageComponent = new EnergyUsageComponent(gameState, 'hud-energy-usage');
  }


  initPageCode() {
    this.energyUsageComponent.initPageCode();
  }

  renderHTML() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-top-left">
        ${this.energyUsageComponent.renderHTML()}
      </div>
    `;
  }
}