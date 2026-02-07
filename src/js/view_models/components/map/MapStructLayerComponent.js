import {EVENTS} from "../../../constants/Events";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {Player} from "../../../models/Player";
import {Struct} from "../../../models/Struct";
import {GenericMapLayerComponent} from "./GenericMapLayerComponent";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {AmbitUtil} from "../../../util/AmbitUtil";


export class MapStructLayerComponent extends GenericMapLayerComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {string[]} mapColBreakdown
   * @param {Planet|null} planet
   * @param {Player|null} defender
   * @param {Player|null} attacker
   * @param {Fleet|null} defenderFleet
   * @param {Fleet|null} attackerFleet
   * @param {string} containerId - The ID of the DOM container element for this struct layer
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
      'map-struct-layer-row',
      'map-struct-layer-tile',
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

    this.structStillBuilder = new StructStillBuilder(this.gameState);
    this.ambitUtil = new AmbitUtil();
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

    if (!struct.isBuilt()) {
      return this.renderDeploymentIndicatorHTML();
    }

    const structType = this.gameState.structTypes.getStructTypeById(struct.type)

    // Completed struct - render the struct image
    const structStill = this.structStillBuilder.build(structType.type);
    return structStill.renderHTML();
  }

  /**
   * @param {HTMLElement} tileElement
   * @param {Struct} struct
   */
  renderStruct(tileElement, struct) {
    tileElement.innerHTML = this.renderStructContent(struct);
    tileElement.setAttribute('data-struct-id', struct ? struct.id : '');
  }

  /**
   * @param {HTMLElement} tileElement
   */
  renderStructFromTileElement(tileElement) {
    const renderParams = this.buildMapStructTilRenderParamsFromTileElement(tileElement);
    if (renderParams) {
      this.renderStruct(renderParams.tileElement, renderParams.struct);
    }
  }

  /**
   * @param {Struct} struct
   */
  renderStructFromStruct(struct) {
    const renderParams = this.buildMapStructTilRenderParamsFromStruct(struct);
    if (renderParams) {
      this.renderStruct(renderParams.tileElement, renderParams.struct);
    }
  }

  /**
   * Sync all struct tiles in the container by looking up structs for each tile
   */
  renderAllStructs() {
    const container = document.getElementById(this.containerId);
    const tiles = container.querySelectorAll('.map-struct-layer-tile');
    tiles.forEach(tileElement => this.renderStructFromTileElement(tileElement));
  }

  /**
   * Mark enemy structs as invalid selections when entering defend mode.
   */
  showDefendTargets() {
    const container = document.getElementById(this.containerId);
    const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const tiles = container.querySelectorAll(`.map-struct-layer-tile[data-side="right"][data-player-id^="1"]:not([data-player-id="${playerId}"])`);
    tiles.forEach(tile => {
      tile.classList.add('mod-invalid-selection');
    });
  }

  /**
   * Clear all defend target indicators.
   */
  clearDefendTargets() {
    const container = document.getElementById(this.containerId);
    const tiles = container.querySelectorAll('.map-struct-layer-tile.mod-invalid-selection');
    tiles.forEach(tile => {
      tile.classList.remove('mod-invalid-selection');
    });
  }

  /**
   * Mark enemy structs as invalid selections when entering attack mode
   * if their operating ambit does not fall within the weapon's ambit array.
   *
   * @param {string[]} weaponAmbitsArray - Valid target ambits for the weapon (e.g. ["space", "air"])
   */
  showAttackTargets(weaponAmbitsArray) {
    const container = document.getElementById(this.containerId);
    const attackingPlayerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const attackingStruct = this.gameState.actionBarLock.getActionSourceStruct();
    const tiles = container.querySelectorAll(`.map-struct-layer-tile[data-struct-id^="5"]`);

    tiles.forEach(tile => {
      const ambit = tile.getAttribute('data-ambit');
      const playerId = tile.getAttribute('data-player-id');
      const structId = tile.getAttribute('data-struct-id');

      // Mark as invalid if the struct's operating ambit is not in the weapon's ambit array
      // or the struct belongs to the player except if it's the attacking struct
      if (
        attackingStruct.id !== structId
        && (
          attackingPlayerId === playerId
          || !this.ambitUtil.contains(weaponAmbitsArray, ambit, attackingStruct.operating_ambit)
        )
      ) {
        tile.classList.add('mod-invalid-selection');
      }
    });
  }

  /**
   * Clear all attack target indicators.
   */
  clearAttackTargets() {
    const container = document.getElementById(this.containerId);
    const tiles = container.querySelectorAll('.map-struct-layer-tile.mod-invalid-selection');
    tiles.forEach(tile => {
      tile.classList.remove('mod-invalid-selection');
    });
  }

  /**
   * Initialize page code: populate structs and set up event listeners
   */
  initPageCode() {
    // Populate initial structs
    this.renderAllStructs();

    // Listen for RENDER_ALL_STRUCTS events
    window.addEventListener(EVENTS.RENDER_ALL_STRUCTS, (event) => {
      if (event.mapId === this.mapId) {
        this.renderAllStructs();
      }
    });

    // Listen for RENDER_STRUCT events
    window.addEventListener(EVENTS.RENDER_STRUCT, (event) => {
      if (event.mapId === this.mapId) {
        this.renderStructFromStruct(event.struct);
      }
    });

    window.addEventListener(EVENTS.RENDER_DEPLOYMENT_INDICATOR, (event) => {
      if (event.mapId === this.mapId) {
        this.renderDeploymentIndicator(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });

    // Listen for CLEAR_STRUCT_TILE events (when a build is canceled)
    window.addEventListener(EVENTS.CLEAR_STRUCT_TILE, (event) => {
      if (event.mapId === this.mapId) {
        this.clearTile(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });

    // Listen for SHOW_DEFEND_TARGETS events
    window.addEventListener(EVENTS.SHOW_DEFEND_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.showDefendTargets();
      }
    });

    // Listen for CLEAR_DEFEND_TARGETS events
    window.addEventListener(EVENTS.CLEAR_DEFEND_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.clearDefendTargets();
      }
    });

    // Listen for SHOW_ATTACK_TARGETS events
    window.addEventListener(EVENTS.SHOW_ATTACK_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.showAttackTargets(event.weaponAmbitsArray);
      }
    });

    // Listen for CLEAR_ATTACK_TARGETS events
    window.addEventListener(EVENTS.CLEAR_ATTACK_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.clearAttackTargets();
      }
    });
  }
}
