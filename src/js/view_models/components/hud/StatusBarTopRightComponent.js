import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_CONTAINER_IDS} from "../../../constants/MapConstants";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {ShieldStatusComponent} from "../ShieldStatusComponent";

export class StatusBarTopRightComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {Boolean} isRaidPlanet
   * @param {string} id
   * @param {string} planetOwnerPlayerType the type of key player that owns the planet
   */
  constructor(gameState, isRaidPlanet, id, planetOwnerPlayerType) {
    super(gameState);
    this.id = id;
    this.isRaidPlanet = isRaidPlanet;
    this.planetOwnerPlayerType = planetOwnerPlayerType;
    this.prefix = '';
    this.theme = '';
    this.oreCountChangedEvent = EVENTS.ORE_COUNT_CHANGED;

    if (this.isRaidPlanet) {
      this.prefix = 'raid-';
      this.theme = 'sui-theme-enemy';
    }

    this.startHidden = ((this.gameState.activeMapContainerId === MAP_CONTAINER_IDS.RAID) === this.isRaidPlanet)
      ? '' : 'hidden';

    this.hudShieldStatusId = `${this.prefix}hud-shield-status`;
    this.hudOreValueId = `${this.prefix}hud-ore`;
    this.hudOreHintId = `${this.prefix}${this.hudOreValueId}-hint`;

    this.shieldStatusComponent = new ShieldStatusComponent(
      this.gameState,
      this.planetOwnerPlayerType,
      this.hudShieldStatusId
    );
  }

  initPageCode() {
    this.shieldStatusComponent.initPageCode();

    window.addEventListener(this.oreCountChangedEvent, function (event) {
      if (
        (this.isRaidPlanet && event.playerType === PLAYER_TYPES.RAID_ENEMY && this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player)
        || (!this.isRaidPlanet && event.playerType === PLAYER_TYPES.PLAYER && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player)
      ) {
        document.getElementById(this.hudOreValueId).innerText = `${this.gameState.keyPlayers[event.playerType].player.ore}`;
      }
    }.bind(this));
  }

  renderHTML() {
    return `
      <div id="${this.id}" class="sui-status-bar-panel status-bar-panel-top-right ${this.theme} ${this.startHidden}">
        ${this.shieldStatusComponent.renderHTML()}
        <a 
          id="${this.hudOreHintId}" 
          class="sui-resource"
          href="javascript: void(0)" 
          data-sui-tooltip="Alpha Ore"
        >
          <i class="sui-icon sui-icon-alpha-ore"></i>
          <span id="${this.hudOreValueId}"></span>
        </a>
      </div>
    `;
  }
}