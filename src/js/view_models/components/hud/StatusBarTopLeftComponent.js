import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EnergyUsageComponent} from "../EnergyUsageComponent";

export class StatusBarTopLeftComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {string} id
   */
  constructor(gameState, id) {
    super(gameState);
    this.id = id;
    this.energyUsageComponent = new EnergyUsageComponent(gameState, 'hud-energy-usage');
  }


  initPageCode() {
    this.energyUsageComponent.initPageCode();
  }

  renderHTML() {
    return `
      <div id="${this.id}" class="sui-status-bar-panel status-bar-panel-top-left">
        ${this.energyUsageComponent.renderHTML()}
      </div>
    `;
  }
}