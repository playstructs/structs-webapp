import {MAP_TILE_TYPES} from "../../../constants/MapConstants";
import {EVENTS} from "../../../constants/Events";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {Player} from "../../../models/Player";
import {Struct} from "../../../models/Struct";
import {GenericMapLayerComponent} from "./GenericMapLayerComponent";


export class MapStructLayerComponent extends GenericMapLayerComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {string} containerId - The ID of the DOM container element for this struct layer
   */
  constructor(
    gameState,
    structManager,
    mapColBreakdown,
    planet,
    defender,
    attacker,
    containerId = ""
  ) {
    super(
      gameState,
      'map-struct-layer-row',
      'map-struct-layer-tile',
      structManager,
      mapColBreakdown,
      planet,
      defender,
      attacker
    );

    this.containerId = containerId;
    this.structStillBuilder = new StructStillBuilder(this.gameState);
  }

  /**
   * @return {string}
   */
  renderDeploymentIndicatorHTML() {
    return `
      <div class="deployment-indicator">
        <img src="/img/structs/deployment-indicator/deployment-indicator.gif" alt="Deployment Indicator">
      </div>
    `;
  }

  /**
   * Render the deployment indicator over a particular tile.
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  renderDeploymentIndicator(tileType, ambit, slot, playerId) {
    const selector = this.buildTileSelector(tileType, ambit, slot, playerId);
    const container = document.getElementById(this.containerId);
    const tileElement = container.querySelector(selector);
    tileElement.innerHTML = this.renderDeploymentIndicatorHTML();
  }

  /**
   * Render the content inside a struct tile (struct image or building indicator)
   * @param {Struct|null} struct
   * @return {string}
   */
  renderStructContent(struct) {
    if (!struct) {
      return '';
    }

    if (struct.is_building) {
      return this.renderDeploymentIndicatorHTML();
    }

    const structType = this.gameState.structTypes.getStructTypeById(struct.type)

    // Completed struct - render the struct image
    const structStill = this.structStillBuilder.build(structType.type);
    return structStill.renderHTML();
  }

  /**
   * Build CSS selector for finding a struct tile
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @return {string}
   */
  buildTileSelector(tileType, ambit, slot, playerId) {
    return `.map-struct-layer-tile[data-tile-type="${tileType}"][data-ambit="${ambit}"][data-slot="${slot}"][data-player-id="${playerId}"]`;
  }

  /**
   * Find and update a single struct tile by position
   * @param {Struct} struct
   */
  renderStruct(struct) {
    const tileType = this.structManager.getTileTypeFromStruct(struct);
    if (!tileType) {
      return;
    }

    const ambit = struct.operating_ambit ? struct.operating_ambit.toUpperCase() : '';
    const selector = this.buildTileSelector(tileType, ambit, struct.slot, struct.owner);
    const container = document.getElementById(this.containerId);
    const tileElement = container.querySelector(selector);
    tileElement.innerHTML = this.renderStructContent(struct);
  }

  /**
   * Check if tile has required position data attributes
   * @param {string} tileType
   * @param {string} ambit
   * @param {string} slot
   * @param {string} playerId
   * @return {boolean}
   */
  hasTilePositionData(tileType, ambit, slot, playerId) {
    return !!(tileType && ambit && slot !== '' && playerId);
  }

  /**
   * Get location info for a tile based on its type and player
   * @param {string} tileType
   * @param {string} playerId
   * @return {{locationType: string, locationId: string|null, isCommandSlot: boolean}|null}
   */
  getLocationInfoFromTile(tileType, playerId) {
    if (tileType === MAP_TILE_TYPES.PLANETARY_SLOT) {
      return {
        locationType: 'planet',
        locationId: this.planet.id,
        isCommandSlot: false
      };
    }

    if (tileType === MAP_TILE_TYPES.COMMAND || tileType === MAP_TILE_TYPES.FLEET) {
      let locationId = null;
      if (this.defender && playerId === this.defender.id) {
        locationId = this.defender.fleet_id;
      } else if (this.attacker && playerId === this.attacker.id) {
        locationId = this.attacker.fleet_id;
      }

      return {
        locationType: 'fleet',
        locationId: locationId,
        isCommandSlot: (tileType === MAP_TILE_TYPES.COMMAND)
      };
    }

    return null;
  }

  /**
   * Update a single tile with struct data
   * @param {HTMLElement} tileElement
   */
  updateTileWithStruct(tileElement) {
    const tileType = tileElement.getAttribute('data-tile-type');
    const ambit = tileElement.getAttribute('data-ambit');
    const slot = tileElement.getAttribute('data-slot');
    const playerId = tileElement.getAttribute('data-player-id');

    if (!this.hasTilePositionData(tileType, ambit, slot, playerId)) {
      return;
    }

    const locationInfo = this.getLocationInfoFromTile(tileType, playerId);
    if (!locationInfo) {
      return;
    }

    const slotNum = parseInt(slot, 10);
    const struct = this.structManager.getStructByPositionAndPlayerId(
      playerId,
      locationInfo.locationType,
      locationInfo.locationId,
      ambit,
      slotNum,
      locationInfo.isCommandSlot
    );

    tileElement.innerHTML = this.renderStructContent(struct);
  }

  /**
   * Sync all struct tiles in the container by looking up structs for each tile
   */
  renderAllStructs() {
    const container = document.getElementById(this.containerId);
    const tiles = container.querySelectorAll('.map-struct-layer-tile');
    tiles.forEach(tileElement => this.updateTileWithStruct(tileElement));
  }

  /**
   * Initialize page code: populate structs and set up event listeners
   */
  initPageCode() {
    // Populate initial structs
    this.renderAllStructs();

    // Listen for RENDER_ALL_STRUCTS events
    window.addEventListener(EVENTS.RENDER_ALL_STRUCTS, (event) => {
      if (event.containerId === this.containerId) {
        this.renderAllStructs();
      }
    });

    // Listen for RENDER_STRUCT events
    window.addEventListener(EVENTS.RENDER_STRUCT, (event) => {
      if (event.containerId === this.containerId) {
        this.renderStruct(event.struct);
      }
    });

    window.addEventListener(EVENTS.RENDER_DEPLOYMENT_INDICATOR, (event) => {
      if (event.containerId === this.containerId) {
        this.renderDeploymentIndicator(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });
  }
}
