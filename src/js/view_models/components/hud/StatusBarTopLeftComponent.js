import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MenuPage} from "../../../framework/MenuPage";

export class StatusBarTopLeftComponent extends AbstractViewModelComponent {

  initPageCode() {
    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, function () {
      let totalLoad = this.gameState.thisPlayer.load + this.gameState.thisPlayer.structs_load;
      let totalCapacity = this.gameState.thisPlayer.capacity + this.gameState.thisPlayer.connection_capacity;
      totalLoad = this.numberFormatter.format(totalLoad);
      totalCapacity = this.numberFormatter.format(totalCapacity);
      document.getElementById('hud-energy-usage').innerText = `${totalLoad}/${totalCapacity}`;
    }.bind(this));

    MenuPage.sui.tooltip.init(document.getElementById('hud-energy-usage-hint'));
  }

  renderHTML() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-top-left">
        <a 
          id="hud-energy-usage-hint" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Energy Supply"
        >
          <span id="hud-energy-usage"></span>
          <i class="sui-icon sui-icon-energy"></i>
        </a>
      </div>
    `;
  }
}