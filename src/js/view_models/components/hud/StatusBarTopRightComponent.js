import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MenuPage} from "../../../framework/MenuPage";

export class StatusBarTopRightComponent extends AbstractViewModelComponent {

  initPageCode() {
    window.addEventListener(EVENTS.SHIELD_HEALTH_CHANGED, function () {
      document.getElementById('hud-shield-health').innerText = `100`; // TODO: Awaiting working stargate ts client
    }.bind(this));

    window.addEventListener(EVENTS.ORE_COUNT_CHANGED, function () {
      document.getElementById('hud-ore').innerText = `${this.gameState.thisPlayer.ore}`;
    }.bind(this));

    MenuPage.sui.tooltip.init(document.getElementById('hud-shield-health-hint'));
    MenuPage.sui.tooltip.init(document.getElementById('hud-ore-hint'));
  }

  renderHTML() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-top-right">
        <a 
          id="hud-shield-health-hint" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Planetary Shield"
        >
          <span id="hud-shield-health"></span>
          <i class="sui-icon sui-icon-shield-health"></i>
        </a>
        <a 
          id="hud-ore-hint" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Alpha Ore"
        >
          <span id="hud-ore"></span>
          <i class="sui-icon sui-icon-alpha-ore"></i>
        </a>
      </div>
    `;
  }
}