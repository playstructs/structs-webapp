import {AbstractViewModel} from "../framework/AbstractViewModel";
import {EVENTS} from "../constants/Events";

export class HUDViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
  }

  initPageCode() {
    window.addEventListener(EVENTS.ENERGY_USAGE_CHANGED, function () {
      document.getElementById('hud-energy-usage').innerText = `${this.gameState.thisPlayer.load}/${this.gameState.thisPlayer.capacity}`;
    }.bind(this));

    window.addEventListener(EVENTS.SHIELD_HEALTH_CHANGED, function () {
      document.getElementById('hud-shield-health').innerText = `100`; // TODO: Awaiting working stargate ts client
    }.bind(this));

    window.addEventListener(EVENTS.ORE_COUNT_CHANGED, function () {
      document.getElementById('hud-ore').innerText = `${this.gameState.thisPlayer.ore}`;
    }.bind(this));
  }

  render() {
    return `
      <div class="sui-status-bar-panel status-bar-panel-energy">
        <a href="javascript: void(0)" class="sui-resource">
          <span id="hud-energy-usage"></span>
          <i class="sui-icon sui-icon-energy"></i>
        </a>
      </div>

      <div class="sui-status-bar-panel status-bar-panel-health-ore">
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
