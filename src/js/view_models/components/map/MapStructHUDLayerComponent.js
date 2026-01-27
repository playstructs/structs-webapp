import {GenericMapLayerComponent} from "./GenericMapLayerComponent";


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
   * Render the content for a single HUD tile
   * @param tileType
   * @param ambit
   * @param slot
   * @param playerId
   */
  renderStructHUD(tileType, ambit, slot, playerId) {
    const selector = this.buildTileSelector(tileType, ambit, slot, playerId);
    const container = document.getElementById(this.containerId);
    const tileElement = container.querySelector(selector);
    tileElement.innerHTML = '';
  }

  /**
   * Initialize page code: set up event listeners for future expansion
   */
  initPageCode() {
    // Future event listeners will be added here
  }
}
