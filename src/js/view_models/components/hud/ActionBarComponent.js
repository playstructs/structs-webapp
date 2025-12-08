import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_TILE_TYPE_ICONS, MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {DeployOffcanvas} from "../offcanvas/DeployOffcanvas";

export class ActionBarComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {string} playerType
   * @param {string} align left or right
   * @param {string} id
   */
  constructor(
    gameState,
    signingClientManager,
    playerType,
    align,
    id
  ) {
    super(gameState);

    this.playerType = playerType;
    this.signingClientManager = signingClientManager;

    /* Style */
    this.themeClass = `sui-theme-${this.playerType === PLAYER_TYPES.PLAYER ? 'player' : 'enemy'}`;
    this.align = align;

    /* IDs */
    this.id = id;
    this.playerChunkId = `${this.playerType}-action-bar-player-chunk`;
    this.playerChunkPortraitId = `${this.playerType}-action-bar-portrait`;
    this.playerChunkBatteryId = `${this.playerType}-action-bar-battery`;
    this.connectorId = `${this.playerType}-action-bar-connector`;
    this.actionChunkId = `${this.playerType}-action-bar-action-chunk`;
    this.headerScreenId = `${this.playerType}-action-bar-header`;
    this.propertiesScreenId = `${this.playerType}-action-bar-properties-screen`;

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

    document.getElementById(this.playerChunkPortraitId).addEventListener('click', this.profileClickHandler.bind(this));
  }

  renderChargeLevel(level) {
    const battery = document.getElementById(this.playerChunkBatteryId);
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
    const hoverIcon = this.playerType === PLAYER_TYPES.PLAYER ? 'icon-menu' : 'icon-info';
    return `
      <div id="${this.playerChunkId}" class="sui-panel-chunk">
  
        <div class="sui-screen">
          <a id="${this.playerChunkPortraitId}" href="javascript: void(0)" class="sui-screen-portrait">
            <div class="sui-screen-portrait-image"></div>
            <i class="sui-icon-md ${hoverIcon}"></i>
          </a>
        </div>
        <div class="sui-screen">
          <div id="${this.playerChunkBatteryId}" class="sui-screen-battery">
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

  showActionChunk() {
    document.getElementById(this.connectorId).classList.remove('hidden');
    document.getElementById(this.actionChunkId).classList.remove('hidden');
  }

  hideActionChunk() {
    document.getElementById(this.connectorId).classList.add('hidden');
    document.getElementById(this.actionChunkId).classList.add('hidden');
  }

  /**
   *
   * @param {string} tileType see MAP_TILE_TYPES
   * @return {string} icon class
   */
  getPropertyIconForTileType(tileType) {
    if (
      this.align === 'right'
      && (
        tileType === MAP_TILE_TYPES.COMMAND
        || tileType === MAP_TILE_TYPES.PLANETARY_SLOT
        || tileType === MAP_TILE_TYPES.FLEET
      )
    ) {
      return MAP_TILE_TYPE_ICONS.ENEMY_TERRITORY;
    }

    return MAP_TILE_TYPE_ICONS[tileType];
  }

  /**
   * @param {string} tileType
   * @param {string} ambitOrTileLabel
   * @param {string} side right or left
   * @param {number|null} slot
   */
  showEmptyTile(
    tileType,
    ambitOrTileLabel,
    side,
    slot = null
  ) {
    const header = ambitOrTileLabel.toUpperCase();

    const propertyIcon = this.getPropertyIconForTileType(tileType);
    const propertyIconLinkId = `${this.playerType}-action-bar-property-tile-type`;

    const hasDeployButton = tileType === MAP_TILE_TYPES.PLANETARY_SLOT
      || tileType === MAP_TILE_TYPES.FLEET
      || tileType === MAP_TILE_TYPES.COMMAND;
    let deployBtn = '';
    const deployBtnId = `${this.playerType}-action-bar-deploy-btn`;
    let attachDeployBtnHandler = () => {};
    let btnTypeClass = 'sui-mod-disabled';

    if (hasDeployButton) {

      if (side === 'left') {
        btnTypeClass = 'sui-mod-default';
        attachDeployBtnHandler = () => {
          document.getElementById(deployBtnId).addEventListener('click', function () {
            const deployOffcanvas = new DeployOffcanvas(
              this.gameState,
              this.signingClientManager,
              tileType,
              ambitOrTileLabel,
              slot
            );
            deployOffcanvas.render();
          }.bind(this));
        };
      }

      deployBtn = `
        <div class="sui-action-bar-btn-group">
          <a 
            id="${deployBtnId}"
            href="javascript: void(0)"
            class="sui-panel-btn ${btnTypeClass}"
          >
            <i class="sui-icon-md icon-deploy"></i>
          </a>
        </div>
      `;
    }

    document.getElementById(this.actionChunkId).innerHTML = `
      <div class="sui-screen sui-screen-full-width">
        <div id="${this.headerScreenId}" class="sui-screen-info">${header}</div>
      </div>

      <div class="sui-action-bar-bottom-row">

        <div id="${this.propertiesScreenId}" class="sui-screen">
          <div class="sui-screen-properties">
            <a id="${propertyIconLinkId}" href="javascript: void(0)" data-sui-cheatsheet="${propertyIcon}">
              <i class="sui-icon-md ${propertyIcon}"></i>
            </a>
          </div>
        </div>

        ${deployBtn}

      </div>
    `;

    attachDeployBtnHandler();

    this.showActionChunk();
  }

  renderHTML() {
    let actionChunkLeftHTML = '';
    let actionChunkRightHTML = `
      <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
    `;

    if (this.align === 'right') {
      actionChunkLeftHTML = `
        <div id="${this.actionChunkId}" class="sui-panel-chunk hidden"></div>
        <div id="${this.connectorId}" class="sui-panel-connector hidden"></div>
      `;
      actionChunkRightHTML = '';
    }

    return `
      <div id="${this.id}" class="sui-panel-wrapper-fit-content action-bar-bottom-${this.align}">
        <div class="sui-panel ${this.themeClass}">
          <div class="sui-panel-edge-left"></div>
          
            ${actionChunkLeftHTML}
          
            ${this.renderPortraitChunkHTML()}
            
            ${actionChunkRightHTML}
                      
          <div class="sui-panel-edge-right"></div>
        </div>
      </div>
    `;
  }
}