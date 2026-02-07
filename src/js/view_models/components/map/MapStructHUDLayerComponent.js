import {GenericMapLayerComponent} from "./GenericMapLayerComponent";
import {Struct} from "../../../models/Struct"
import {EVENTS} from "../../../constants/Events";


export class MapStructHUDLayerComponent extends GenericMapLayerComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {Fleet|null} defenderFleet
   * @param {Fleet|null} attackerFleet
   * @param {string} containerId - The ID of the DOM container element for this HUD layer
   * @param {string} mapId
   */
  constructor(
    gameState,
    structManager,
    mapColBreakdown,
    planet,
    defender,
    attacker,
    defenderFleet,
    attackerFleet,
    containerId = "",
    mapId = ""
  ) {
    super(
      gameState,
      'map-struct-hud-layer-row',
      'map-struct-hud-layer-tile',
      structManager,
      mapColBreakdown,
      planet,
      defender,
      attacker,
      defenderFleet,
      attackerFleet,
      containerId,
      mapId
    );
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderHealthBar(struct) {
    if (!struct.isBuilt()) {
      return '';
    }

    const structType = this.gameState.structTypes.getStructTypeById(struct.type);
    const segments = [];

    for (let i = 0; i < structType.max_health; i++) {
      segments.push(`<div class="struct-health-bar-segment ${(i < struct.health) ? 'mod-filled' : ''}"></div>`);
    }

    return `
      <div class="struct-health-bar">
        ${segments.join('')}
      </div>
    `;
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderIndicatorIsDefended(struct) {
    return !struct.isDestroyed() && struct.isDefended()
      ? `<i class="sui-icon sui-icon-sm sui-icon-defended"></i>`
      : '';
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderIndicatorIsDefending(struct) {
    return !struct.isDestroyed() && struct.isDefending()
      ? `<i class="sui-icon sui-icon-sm sui-icon-defending"></i>`
      : '';
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderIndicatorIsHidden(struct) {
    return !struct.isDestroyed() && struct.isHidden()
      ? `<i class="sui-icon sui-icon-sm sui-icon-stealth-mode"></i>`
      : '';
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderIndicatorIsDestroyed(struct) {
    return struct.isDestroyed()
      ? `<i class="sui-icon sui-icon-sm sui-icon-destroyed"></i>`
      : '';
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderIndicatorIsOffline(struct) {
    return !struct.isDestroyed() && struct.isBuilt() && !struct.isOnline()
      ? `<i class="sui-icon sui-icon-sm sui-icon-no-power"></i>`
      : '';
  }

  /**
   * @param {Struct} struct
   * @return {string}
   */
  renderStatusIndicators(struct) {
    return `
      <div class="map-struct-hud-status-indicators">
        ${this.renderIndicatorIsDestroyed(struct)}
        ${this.renderIndicatorIsOffline(struct)}
        ${this.renderIndicatorIsDefended(struct)}
        ${this.renderIndicatorIsDefending(struct)}
        ${this.renderIndicatorIsHidden(struct)}
      </div>
    `;
  }

  /**
   * Render the content for a single HUD tile
   * @param {HTMLElement} tileElement
   * @param {Struct|null} struct
   */
  renderStructHUD(tileElement, struct = null) {
    if (struct && struct.isBuilt()) {
      tileElement.innerHTML = `
        <div class="map-struct-hud-status-bars">
          ${this.renderHealthBar(struct)}
        </div>      
        ${this.renderStatusIndicators(struct)}
      `;
      tileElement.setAttribute('data-struct-id', struct.id);
    } else {
      tileElement.innerHTML = '';
      tileElement.setAttribute('data-struct-id', '');
    }
  }

  /**
   * @param {HTMLElement} tileElement
   */
  renderStructHUDFromTileElement(tileElement) {
    const renderParams = this.buildMapStructTilRenderParamsFromTileElement(tileElement);
    if (renderParams) {
      this.renderStructHUD(renderParams.tileElement, renderParams.struct);
    }
  }

  /**
   * @param {Struct} struct
   */
  renderStructHUDFromStruct(struct) {
    const renderParams = this.buildMapStructTilRenderParamsFromStruct(struct);
    if (renderParams) {
      this.renderStructHUD(renderParams.tileElement, renderParams.struct);
    }
  }

  renderAllStructHUDs() {
    const tiles = document.getElementById(this.containerId).querySelectorAll(`.${this.tileClass}`);
    tiles.forEach(tile => {
      this.renderStructHUDFromTileElement(tile);
    });
  }

  /**
   * Initialize page code: set up event listeners for future expansion
   */
  initPageCode() {
    this.renderAllStructHUDs();

    window.addEventListener(EVENTS.RENDER_STRUCT, (event) => {
      if (event.mapId === this.mapId) {
        this.renderStructHUDFromStruct(event.struct);
      }
    });

    // Listen for CLEAR_STRUCT_TILE events (when a build is canceled)
    window.addEventListener(EVENTS.CLEAR_STRUCT_TILE, (event) => {
      if (event.mapId === this.mapId) {
        this.clearTile(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });
  }
}
