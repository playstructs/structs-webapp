import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";

export class ActionBarComponent extends AbstractViewModelComponent {

  constructor(gameState, playerType, align) {
    super(gameState);

    this.playerType = playerType;

    /* IDs */
    this.actionBarPortraitId = `${this.playerType}-screen-portrait`;
    this.actionBarBatteryId = `${this.playerType}-screen-battery`;

    /* Style */
    this.themeClass = `sui-theme-${this.playerType}`;
    this.align = align;
    this.alignClass = `action-bar-bottom-${this.align}`;

    /* Profile Chunk */
    this.profileClickHandler = function () {};
    this.batteryfilledClass = 'sui-mod-filled';
  }

  initPageCode() {
    window.addEventListener(EVENTS.CHARGE_LEVEL_CHANGED, function (event) {
      if (event.playerId === this.gameState.getPlayerIdByType(this.playerType)) {
        this.renderChargeLevel(event.chargeLevel);
      }
    }.bind(this));

    document.getElementById(this.actionBarPortraitId).addEventListener('click', this.profileClickHandler.bind(this));
  }

  renderChargeLevel(level) {
    const battery = document.getElementById(this.actionBarBatteryId);
    const batteryChunks = battery.children;

    for (let i = 0; i < batteryChunks.length; i++) {
      if (i + 1 > level) {
        batteryChunks[i].classList.remove(this.batteryfilledClass);
      } else {
        batteryChunks[i].classList.add(this.batteryfilledClass);
      }
    }
  }

  renderPortraitChunkHTML() {
    return `
      <div class="sui-panel-chunk">
  
        <div class="sui-screen">
          <a id="${this.actionBarPortraitId}" href="javascript: void(0)" class="sui-screen-portrait">
            <div class="sui-screen-portrait-image"></div>
            <i class="sui-icon-md icon-menu"></i>
          </a>
        </div>
        <div class="sui-screen">
          <div id="${this.actionBarBatteryId}" class="sui-screen-battery">
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
            <div class="sui-battery-chunk"></div>
          </div>
        </div>

      </div>
    `;
  }

  renderHTML() {
    return `
      <div class="sui-panel-wrapper-fit-content action-bar-bottom-${this.align}">
        <div class="sui-panel ${this.themeClass}">
          <div class="sui-panel-edge-left"></div>
          
            ${this.renderPortraitChunkHTML()}
                      
          <div class="sui-panel-edge-right"></div>
        </div>
      </div>
    `;
  }
}