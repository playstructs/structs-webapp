import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_CONTAINER_IDS} from "../../../constants/MapConstants";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";

export class StatusBarTopRightComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {Boolean} isRaidPlanet
   * @param {string} id
   */
  constructor(gameState, isRaidPlanet, id) {
    super(gameState);
    this.id = id;
    this.isRaidPlanet = isRaidPlanet;
    this.prefix = '';
    this.theme = '';
    this.shieldIcon = 'sui-icon-shield-health';
    this.shieldHealthChangedEvent = EVENTS.SHIELD_HEALTH_CHANGED;
    this.oreCountChangedEvent = EVENTS.ORE_COUNT_CHANGED;

    if (this.isRaidPlanet) {
      this.prefix = 'raid-';
      this.theme = 'sui-theme-enemy';
      this.shieldIcon ='sui-icon-enemy-shield-health';
      this.shieldHealthChangedEvent = EVENTS.SHIELD_HEALTH_CHANGED_RAID_PLANET;
      this.oreCountChangedEvent = EVENTS.ORE_COUNT_CHANGED_RAID_ENEMY;
    }

    this.startHidden = ((this.gameState.activeMapContainerId === MAP_CONTAINER_IDS.RAID) === this.isRaidPlanet)
      ? '' : 'hidden';

    this.hudShieldHealthValueId = `${this.prefix}hud-shield-health`;
    this.hudShieldHealthHintId = `${this.prefix}${this.hudShieldHealthValueId}-hint`;
    this.hudOreValueId = `${this.prefix}hud-ore`;
    this.hudOreHintId = `${this.prefix}${this.hudOreValueId}-hint`;
  }

  initPageCode() {
    window.addEventListener(this.shieldHealthChangedEvent, function () {
      document.getElementById(this.hudShieldHealthValueId).innerText = this.isRaidPlanet
        ? `${this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldHealth}`
        : `${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldHealth}`;
    }.bind(this));

    window.addEventListener(this.oreCountChangedEvent, function () {
      if (this.isRaidPlanet && this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player) {
        document.getElementById(this.hudOreValueId).innerText = `${this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player.ore}`;
      } else if (!this.isRaidPlanet && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player) {
        document.getElementById(this.hudOreValueId).innerText = `${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.ore}`;
      }
    }.bind(this));
  }

  renderHTML() {
    return `
      <div id="${this.id}" class="sui-status-bar-panel status-bar-panel-top-right ${this.theme} ${this.startHidden}">
        <a 
          id="${this.hudShieldHealthHintId}" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Planetary Shield"
        >
          <span id="${this.hudShieldHealthValueId}"></span>
          <i class="sui-icon ${this.shieldIcon}"></i>
        </a>
        <a 
          id="${this.hudOreHintId}" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Alpha Ore"
        >
          <span id="${this.hudOreValueId}"></span>
          <i class="sui-icon sui-icon-alpha-ore"></i>
        </a>
      </div>
    `;
  }
}