import {GenericMapLayerComponent} from "./GenericMapLayerComponent";
import {Struct} from "../../../models/Struct"


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
   * Render the content for a single HUD tile
   * @param {HTMLElement} tileElement
   * @param {Struct|null} struct
   */
  renderStructHUD(tileElement, struct = null) {
    if (struct) {
      tileElement.innerHTML = `
        <div class="map-struct-hud-status-bars">
          ${this.renderHealthBar(struct)}
        </div>      
        <div class="map-struct-hud-status-indicators">
          <i class="sui-icon sui-icon-sm sui-icon-defended"></i>
          <i class="sui-icon sui-icon-sm sui-icon-defending"></i>
          <i class="sui-icon sui-icon-sm sui-icon-stealth-mode"></i>
          <i class="sui-icon sui-icon-sm sui-icon-destroyed"></i>
        </div>
      `;
    } else {
      tileElement.innerHTML = '';
    }
  }

  /**
   * @param tileElement
   */
  renderStructHUDFromTileElement(tileElement) {
    const renderParams = this.buildMapStructTilRenderParamsFromTileElement(tileElement);
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
  }
}
