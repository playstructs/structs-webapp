import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";

export class StatusBarTopLeftComponent extends AbstractViewModelComponent {

  initPageCode() {
    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, function () {
      document.getElementById('hud-energy-usage').innerText = `${this.gameState.thisPlayer.load}/${this.gameState.thisPlayer.capacity}`;
    }.bind(this));
  }

  renderHTML() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-top-left">
        <a href="javascript: void(0)" class="sui-resource">
          <span id="hud-energy-usage"></span>
          <i class="sui-icon sui-icon-energy"></i>
        </a>
      </div>
    `;
  }
}