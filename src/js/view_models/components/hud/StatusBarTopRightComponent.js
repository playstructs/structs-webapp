import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";

export class StatusBarTopRightComponent extends AbstractViewModelComponent {

  initPageCode() {
    window.addEventListener(EVENTS.SHIELD_HEALTH_CHANGED, function () {
      document.getElementById('hud-shield-health').innerText = `100`; // TODO: Awaiting working stargate ts client
    }.bind(this));

    window.addEventListener(EVENTS.ORE_COUNT_CHANGED, function () {
      document.getElementById('hud-ore').innerText = `${this.gameState.thisPlayer.ore}`;
    }.bind(this));
  }

  renderHTML() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-top-right">
        <a href="javascript: void(0)" class="sui-resource">
          <span id="hud-shield-health"></span>
          <i class="sui-icon sui-icon-shield-health"></i>
        </a>
        <a href="javascript: void(0)" class="sui-resource">
          <span id="hud-ore"></span>
          <i class="sui-icon sui-icon-alpha-ore"></i>
        </a>
      </div>
    `;
  }
}