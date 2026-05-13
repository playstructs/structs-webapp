import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_TILE_ROWS_PER_AMBIT} from "../../../constants/MapConstants";
import {MapStructViewerComponent} from "../MapStructViewerComponent";
import {MapTerrainAmbitComponent} from "./MapTerrainAmbitComponent";
import {MapStructLayerComponent} from "./MapStructLayerComponent";
import {AttackSequenceAnimationUtil} from "../../../util/AttackSequenceAnimationUtil";

/**
 * A 128x128 picture-in-picture overlay that mirrors the currently-animating
 * attack-sequence struct when its tile is fully off-screen.
 *
 * The PIP renders three layers for a single tile (terrain, optional marker,
 * struct viewer) and is positioned `position: fixed` against the browser
 * viewport so it is unaffected by the map's `transform: scale(...)`.
 *
 * The PIP delegates every "render a tile" decision back to the canonical
 * components so behavior stays in sync if those components change:
 *   - terrain      -> `MapTerrainAmbitComponent.renderTile`
 *   - markers      -> `MapTileMarkersComponent.getCellMarker` (wraps `processCell`)
 *   - struct mount -> `MapStructLayerComponent.mountStructViewerInTile`
 *     (extracted from `MapStructLayerComponent.renderStruct`)
 *
 * The PIP's struct viewer runs in "muted" mode (no `AnimationEndEvent`
 * dispatch) so its lottie completions can't drive the global
 * `AnimationEventQueue`.
 */
export class MapPictureInPictureComponent extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   * @param {TileClassNameUtil} tileClassNameUtil
   * @param {MapTileMarkersComponent} mapTileMarkers
   * @param {string[]} mapColBreakdown
   * @param {Planet} planet
   * @param {string} mapId the id of the owning map; only animation events
   * whose `mapId` matches will affect this PIP
   * @param {string} structLayerId the DOM id of the owning map's struct layer
   * (used to locate the struct's tile element for visibility checks)
   * @param {string} containerId the DOM id this PIP renders into
   * @param {string} idPrefix used to build the PIP viewer's id prefix so its
   * internal lottie container ids don't collide with the on-map viewer's
   * ids for the same struct
   */
  constructor(
    gameState,
    structManager,
    tileClassNameUtil,
    mapTileMarkers,
    mapColBreakdown,
    planet,
    mapId,
    structLayerId,
    containerId,
    idPrefix
  ) {
    super(gameState);
    this.structManager = structManager;
    this.tileClassNameUtil = tileClassNameUtil;
    this.mapTileMarkers = mapTileMarkers;
    this.mapColBreakdown = mapColBreakdown;
    this.planet = planet;
    this.mapId = mapId;
    this.structLayerId = structLayerId;
    this.containerId = containerId;
    this.idPrefix = idPrefix;

    this.viewerIdPrefix = `pip-${this.idPrefix}-`;

    // Reused for `renderTile`, `rowIndexToVerticalPos`, and
    // `colIndexToHorizontalPos`. The instance is ambit-agnostic (the methods
    // we call accept ambit as a parameter or only consult mapColCount /
    // rowsPerAmbit), so a single helper is enough for every PIP render.
    this.terrainAmbitHelper = new MapTerrainAmbitComponent(
      this.gameState,
      this.tileClassNameUtil,
      '',
      this.mapColBreakdown.length,
      MAP_TILE_ROWS_PER_AMBIT
    );

    /** @type {string|null} struct id this PIP is currently tracking */
    this.activeStructId = null;

    /** @type {MapStructViewerComponent|null} */
    this.activeViewer = null;

    /** @type {Array<{target: EventTarget, event: string, handler: EventListener}>} */
    this.windowEventHandlers = [];
  }

  /**
   * @return {string}
   */
  renderHTML() {
    return `<div id="${this.containerId}" class="map-pip"></div>`;
  }

  /**
   * @return {HTMLElement|null}
   */
  getContainer() {
    return document.getElementById(this.containerId);
  }

  /**
   * Locate the on-map tile element for the given struct id, scoped to this
   * PIP's owning map.
   *
   * @param {string} structId
   * @return {HTMLElement|null}
   */
  findTileElement(structId) {
    if (!structId) {
      return null;
    }
    const structLayer = document.getElementById(this.structLayerId);
    if (!structLayer) {
      return null;
    }
    return structLayer.querySelector(`.map-struct-layer-tile[data-struct-id="${structId}"]`);
  }

  /**
   * Determine whether a tile element is fully off-screen relative to the
   * browser viewport. Returns false when any part of the tile is visible.
   *
   * @param {HTMLElement|null} tileElement
   * @return {boolean}
   */
  isTileFullyOffscreen(tileElement) {
    if (!tileElement) {
      return false;
    }
    const rect = tileElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return (
      rect.bottom <= 0
      || rect.top >= viewportHeight
      || rect.right <= 0
      || rect.left >= viewportWidth
    );
  }

  /**
   * Determine the (rowIndex within ambit, colIndex within row) of a struct
   * layer tile by walking the DOM. Transition rows and ambit boundary rows
   * stop the upward walk.
   *
   * @param {HTMLElement} tileElement
   * @return {{rowIndex: number, colIndex: number}|null}
   */
  findAmbitTilePosition(tileElement) {
    const ambit = tileElement.getAttribute('data-ambit');
    const row = tileElement.parentElement;
    if (!ambit || !row) {
      return null;
    }
    const colIndex = Array.from(row.children).indexOf(tileElement);

    let rowIndex = 0;
    let prev = row.previousElementSibling;
    while (prev) {
      const firstSiblingTile = prev.querySelector('.map-struct-layer-tile');
      if (!firstSiblingTile) {
        break;
      }
      if (firstSiblingTile.getAttribute('data-ambit') !== ambit) {
        break;
      }
      rowIndex++;
      prev = prev.previousElementSibling;
    }

    return {rowIndex, colIndex};
  }

  /**
   * Tear down the currently-rendered struct viewer (if any) and clear all PIP
   * markup. Used when transitioning to a new active struct or when destroying
   * the PIP entirely.
   */
  clearPipContents() {
    if (this.activeViewer) {
      this.activeViewer.destroy();
      this.activeViewer = null;
    }
    const container = this.getContainer();
    if (container) {
      container.innerHTML = '';
      container.classList.remove('mod-visible', 'mod-side-left', 'mod-side-right');
    }
    this.activeStructId = null;
  }

  /**
   * Render the PIP contents for the active struct and autoplay the given
   * animation in the embedded viewer.
   *
   * The terrain tile is produced by `MapTerrainAmbitComponent.renderTile`,
   * the marker (if any) by `MapTileMarkersComponent.getCellMarker` (which
   * wraps `processCell`), and the struct viewer by
   * `MapStructLayerComponent.mountStructViewerInTile` (extracted from
   * `MapStructLayerComponent.renderStruct`).
   *
   * @param {string} structId
   * @param {HTMLElement} tileElement on-map tile element backing the struct
   * @param {AnimationEvent} animationEvent the triggering animation event
   * @return {boolean} whether the contents were rendered successfully
   */
  renderForStruct(structId, tileElement, animationEvent) {
    const struct = this.structManager.getStructById(structId);
    const ambit = tileElement.getAttribute('data-ambit');
    const side = tileElement.getAttribute('data-side');
    const tilePos = this.findAmbitTilePosition(tileElement);
    const container = this.getContainer();

    if (
      !struct
      || !struct.isBuilt()
      || !ambit
      || !side
      || !tilePos
      || !container
    ) {
      return false;
    }

    if (this.activeViewer) {
      this.activeViewer.destroy();
      this.activeViewer = null;
    }

    const verticalPos = this.terrainAmbitHelper.rowIndexToVerticalPos(tilePos.rowIndex);
    const horizontalPos = this.terrainAmbitHelper.colIndexToHorizontalPos(tilePos.colIndex);
    const terrainTileHTML = this.terrainAmbitHelper.renderTile(ambit, verticalPos, horizontalPos);
    const markerHTML = this.mapTileMarkers.getCellMarker(ambit, tilePos.rowIndex, tilePos.colIndex) || '';

    container.innerHTML = `
      ${terrainTileHTML}
      ${markerHTML}
      <div class="map-pip-struct"></div>
    `;
    container.classList.remove('mod-side-left', 'mod-side-right');
    container.classList.add(side === 'right' ? 'mod-side-right' : 'mod-side-left');

    this.activeViewer = new MapStructViewerComponent(
      this.gameState,
      this.structManager,
      struct.id,
      struct.type,
      this.mapId,
      this.viewerIdPrefix,
      false
    );

    const structSlot = container.querySelector('.map-pip-struct');
    MapStructLayerComponent.mountStructViewerInTile(structSlot, this.activeViewer, animationEvent);

    this.activeStructId = structId;

    return true;
  }

  /**
   * Update the PIP's visibility class based on whether the active struct's
   * tile is fully off-screen. Called on animation events, scroll, and resize.
   */
  updateVisibility() {
    const container = this.getContainer();
    if (!container) {
      return;
    }
    if (!this.activeStructId) {
      container.classList.remove('mod-visible');
      return;
    }
    const tileElement = this.findTileElement(this.activeStructId);
    if (this.isTileFullyOffscreen(tileElement)) {
      container.classList.add('mod-visible');
    } else {
      container.classList.remove('mod-visible');
    }
  }

  /**
   * Handle an incoming `EVENTS.ANIMATION` event:
   *  - ignore events for other maps
   *  - ignore non-attack-sequence animations
   *  - re-render the PIP for the event's struct, replay the animation in
   *    muted mode, and update visibility
   *
   * @param {AnimationEvent|Event} event
   */
  handleAnimation(event) {
    if (
      !event
      || !event.structId
      || (event.mapId && event.mapId !== this.mapId)
      || !AttackSequenceAnimationUtil.includesAttackSequenceAnimation(event.animationNames || [])
    ) {
      return;
    }

    const tileElement = this.findTileElement(event.structId);
    if (!tileElement) {
      return;
    }

    const rendered = this.renderForStruct(event.structId, tileElement, event);
    if (!rendered) {
      return;
    }

    this.updateVisibility();
  }

  /**
   * @param {string} eventName
   * @param {EventListener|function} handler
   * @param {EventTarget} target
   */
  addEventListenerTracked(eventName, handler, target = window) {
    target.addEventListener(eventName, handler);
    this.windowEventHandlers.push({target, event: eventName, handler});
  }

  initPageCode() {
    this.addEventListenerTracked(EVENTS.ANIMATION, (event) => this.handleAnimation(event));

    const visibilityHandler = () => this.updateVisibility();
    this.addEventListenerTracked('scroll', visibilityHandler, window);
    this.addEventListenerTracked('resize', visibilityHandler, window);
  }

  /**
   * Remove all listeners, destroy the embedded viewer, and clear PIP markup.
   * The container element itself is left in place so the owning
   * `MapComponent` can decide whether to remove it.
   */
  destroy() {
    for (let i = 0; i < this.windowEventHandlers.length; i++) {
      const {target, event, handler} = this.windowEventHandlers[i];
      target.removeEventListener(event, handler);
    }
    this.windowEventHandlers = [];

    this.clearPipContents();
  }
}
