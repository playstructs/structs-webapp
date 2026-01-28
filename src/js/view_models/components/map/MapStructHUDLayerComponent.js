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
   * @param {HTMLElement} tileElement
   */
  renderStructHUD(tileElement) {

    if (!this.hasTilePositionData(
      tileElement.dataset.tileType,
      tileElement.dataset.ambit,
      tileElement.dataset.slot,
      tileElement.dataset.playerId)
    ) {
      return;
    }

    const locationInfo = this.getLocationInfoFromTile(
      tileElement.dataset.tileType,
      tileElement.dataset.playerId
    );

    if (!locationInfo) {
      return;
    }

    const slotNum = parseInt(tileElement.dataset.slot, 10);

    if (locationInfo.locationType === 'planet' || this.isFleetOnPlanet(tileElement.dataset.playerId)) {
      const struct = this.structManager.getStructByPositionAndPlayerId(
        tileElement.dataset.playerId,
        locationInfo.locationType,
        locationInfo.locationId,
        tileElement.dataset.ambit,
        slotNum,
        locationInfo.isCommandSlot
      );

      if (!struct) {
        tileElement.innerHTML = "";
      } else {

        tileElement.innerHTML = `
          <div class="map-struct-hud-status-bars">
            <div class="struct-health-bar">
              <div class="struct-health-bar-segment mod-filled"></div>
              <div class="struct-health-bar-segment mod-filled"></div>
              <div class="struct-health-bar-segment"></div>
            </div>
          </div>      
          <div class="map-struct-hud-status-indicators">
            <i class="sui-icon sui-icon-sm sui-icon-defended"></i>
            <i class="sui-icon sui-icon-sm sui-icon-defending"></i>
            <i class="sui-icon sui-icon-sm sui-icon-stealth-mode"></i>
            <i class="sui-icon sui-icon-sm sui-icon-destroyed"></i>
          </div>
        `;

        }
    } else {
      tileElement.innerHTML = "";
    }
  }

  renderAllStructHUDs() {
    const tiles = document.getElementById(this.containerId).querySelectorAll(`.${this.tileClass}`);
    tiles.forEach(tile => {
      this.renderStructHUD(tile);
    });
  }

  /**
   * Initialize page code: set up event listeners for future expansion
   */
  initPageCode() {
    this.renderAllStructHUDs();
  }
}
