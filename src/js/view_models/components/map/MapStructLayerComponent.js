import {EVENTS} from "../../../constants/Events";
import {StructStillBuilder} from "../../../builders/StructStillBuilder";
import {Player} from "../../../models/Player";
import {Struct} from "../../../models/Struct";
import {GenericMapLayerComponent} from "./GenericMapLayerComponent";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {AmbitUtil} from "../../../util/AmbitUtil";
import {MapStructViewerComponent} from "../MapStructViewerComponent";


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

    /** @type {Object<string, MapStructViewerComponent>} */
    this.mapStructViewers = {};

    /** @type {Array<{event: string, handler: EventListener}>} */
    this.windowEventHandlers = [];
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
   * Destroy and forget the viewer associated with `structId` (if any). This
   * releases the underlying lottie players so their frame caches, image
   * bitmaps, DOM listeners, and SVG renderers can be garbage collected.
   *
   * @param {string} structId
   */
  destroyMapStructViewer(structId) {
    if (structId && this.mapStructViewers[structId]) {
      this.mapStructViewers[structId].destroy();
      delete this.mapStructViewers[structId];
    }
  }

  /**
   * @param {HTMLElement} tileElement
   * @param {Struct} struct
   * @param {AnimationEvent} animationToAutoplay the animation to autoplay once the struct is rendered and ready to play animations
   */
  renderStruct(tileElement, struct, animationToAutoplay = null) {
    if (!struct) {

      const oldStructId = tileElement.getAttribute('data-struct-id');
      this.destroyMapStructViewer(oldStructId);
      tileElement.innerHTML = '';
      if (oldStructId) {
        tileElement.setAttribute('data-struct-id', '');
      }

    } else if (!struct.isBuilt()) {

      // Defensive: if the tile previously held a built struct (whose viewer
      // we own), tear it down before the deployment-indicator overwrite so
      // its lottie players don't leak.
      const oldStructId = tileElement.getAttribute('data-struct-id');
      if (oldStructId && oldStructId !== struct.id) {
        this.destroyMapStructViewer(oldStructId);
      }
      tileElement.innerHTML = this.renderDeploymentIndicatorHTML();
      tileElement.setAttribute('data-struct-id', struct.id);

    } else {

      // Tear down any prior viewer at this key (same struct re-rendering on a
      // status/build/move event) before we overwrite the reference, otherwise
      // lottie-web's internal registry keeps every previously-played
      // animation alive for the lifetime of the page.
      this.destroyMapStructViewer(struct.id);

      this.mapStructViewers[struct.id] = new MapStructViewerComponent(
        this.gameState,
        this.structManager,
        struct.id,
        struct.type,
        this.mapId
      );
      tileElement.innerHTML = this.mapStructViewers[struct.id].renderHTML();
      tileElement.setAttribute('data-struct-id', struct.id);
      if (animationToAutoplay) {
        this.mapStructViewers[struct.id].init(
          animationToAutoplay.animationNames,
          animationToAutoplay.showStructStillDuringAnimation,
          animationToAutoplay.showStructStillAfterAnimation,
          animationToAutoplay.options
        );
      } else {
        this.mapStructViewers[struct.id].init();
      }
    }
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
   * @param {AnimationEvent} animationToAutoplay the animation to autoplay once the struct is rendered and ready to play animations
   */
  renderStructFromStruct(struct, animationToAutoplay = null) {
    const renderParams = this.buildMapStructTilRenderParamsFromStruct(struct);
    if (renderParams) {
      this.renderStruct(renderParams.tileElement, renderParams.struct, animationToAutoplay);
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
   * Register a window event listener and remember it so it can be removed in destroy().
   *
   * @param {string} event
   * @param {EventListener} handler
   */
  addWindowEventListener(event, handler) {
    window.addEventListener(event, handler);
    this.windowEventHandlers.push({event, handler});
  }

  /**
   * Remove all window event listeners registered by this component, destroy
   * every owned struct viewer (releasing its lottie players), and clear
   * viewer references.
   */
  destroy() {
    for (let i = 0; i < this.windowEventHandlers.length; i++) {
      const {event, handler} = this.windowEventHandlers[i];
      window.removeEventListener(event, handler);
    }
    this.windowEventHandlers = [];

    for (const structId in this.mapStructViewers) {
      if (Object.prototype.hasOwnProperty.call(this.mapStructViewers, structId)) {
        this.mapStructViewers[structId].destroy();
      }
    }
    this.mapStructViewers = {};
  }

  /**
   * Initialize page code: populate structs and set up event listeners
   */
  initPageCode() {
    // Populate initial structs
    this.renderAllStructs();

    this.addWindowEventListener(EVENTS.RENDER_ALL_STRUCTS, (event) => {
      if (event.mapId === this.mapId) {
        this.renderAllStructs();
      }
    });

    this.addWindowEventListener(EVENTS.ANIMATION, (event) => {
      if (event.mapId && event.mapId !== this.mapId) {
        return;
      }
      if (this.mapStructViewers[event.structId]) {
        this.mapStructViewers[event.structId].play(
          event.animationNames,
          event.showStructStillDuringAnimation,
          event.showStructStillAfterAnimation,
          event.options
        );
      }
    });

    this.addWindowEventListener(EVENTS.RENDER_STRUCT, (event) => {
      if (event.mapId === this.mapId) {
        this.renderStructFromStruct(event.struct, event.animationToAutoplay);
      }
    });

    this.addWindowEventListener(EVENTS.RENDER_DEPLOYMENT_INDICATOR, (event) => {
      if (event.mapId === this.mapId) {
        this.renderDeploymentIndicator(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });

    this.addWindowEventListener(EVENTS.CLEAR_STRUCT_TILE, (event) => {
      if (event.mapId === this.mapId) {
        this.clearTile(event.tileType, event.ambit, event.slot, event.playerId);
      }
    });

    this.addWindowEventListener(EVENTS.SHOW_DEFEND_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.showDefendTargets();
      }
    });

    this.addWindowEventListener(EVENTS.CLEAR_DEFEND_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.clearDefendTargets();
      }
    });

    this.addWindowEventListener(EVENTS.SHOW_ATTACK_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.showAttackTargets(event.weaponAmbitsArray);
      }
    });

    this.addWindowEventListener(EVENTS.CLEAR_ATTACK_TARGETS, (event) => {
      if (event.mapId === this.mapId) {
        this.clearAttackTargets();
      }
    });
  }
}
