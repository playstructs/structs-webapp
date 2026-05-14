import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {EVENTS} from "../../../constants/Events";
import {MAP_TILE_ROWS_PER_AMBIT} from "../../../constants/MapConstants";
import {MapStructViewerComponent} from "../MapStructViewerComponent";
import {MapTerrainAmbitComponent} from "./MapTerrainAmbitComponent";
import {MapStructLayerComponent} from "./MapStructLayerComponent";
import {AttackSequenceAnimationUtil} from "../../../util/AttackSequenceAnimationUtil";

/**
 * Upper-bound, in milliseconds, on how long to wait for a slide-out
 * `transitionend` before forcing the post-slide-out work to proceed. The CSS
 * transition is 500ms; the extra buffer covers timing jitter and the cases
 * where `transitionend` doesn't fire (e.g. when transitioning to/from `auto`,
 * or when another class change cancels the in-flight transition).
 */
const SLIDE_OUT_FALLBACK_MS = 750;

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

    /**
     * True while the PIP viewer's lottie animation is in flight.
     * Flipped to false in `handleViewerAnimationsComplete`.
     *
     * @type {boolean}
     */
    this.viewerActive = false;

    /**
     * True when the attack sequence has produced a "no continuation" signal
     * (queue empty or next event is not an attack-sequence animation) and we
     * are waiting for the PIP's current animation to finish before hiding.
     *
     * @type {boolean}
     */
    this.pendingHide = false;

    /**
     * Render request that will be applied after the current PIP has slid
     * out. Used to sequence "slide current struct out -> swap contents ->
     * slide new struct in" when an attack-sequence event targets a struct
     * other than the one the PIP is currently mirroring.
     *
     * @type {{structId: string, tileElement: HTMLElement, animationEvent: AnimationEvent}|null}
     */
    this.pendingRender = null;

    /**
     * `transitionend` handler attached to the PIP container while a
     * slide-out is in flight. Tracked so it can be removed exactly once.
     *
     * @type {EventListener|null}
     */
    this.slideOutHandler = null;

    /**
     * Fallback `setTimeout` id ensuring slide-out post-work runs even if
     * `transitionend` is skipped or cancelled.
     *
     * @type {number|null}
     */
    this.slideOutTimeout = null;

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
   * the PIP entirely. Always called only once the PIP is already parked
   * off-screen (so the cleanup doesn't visibly snap the element).
   */
  clearPipContents() {
    this.detachSlideOutListener();
    if (this.activeViewer) {
      this.activeViewer.onAnimationsComplete = null;
      this.activeViewer.destroy();
      this.activeViewer = null;
    }
    const container = this.getContainer();
    if (container) {
      container.innerHTML = '';
      container.classList.remove('mod-visible', 'mod-side-left', 'mod-side-right');
    }
    this.activeStructId = null;
    this.viewerActive = false;
    this.pendingHide = false;
    this.pendingRender = null;
  }

  /**
   * The PIP viewer's lottie animation reached its final frame. If a swap or
   * hide is pending, this is the moment to begin the slide-out: it keeps the
   * exit visually anchored to "the end of the animation" rather than to "the
   * moment the next attack-sequence event was dispatched" (which can happen
   * mid-animation when the on-map and PIP viewers are out of sync).
   */
  handleViewerAnimationsComplete() {
    this.viewerActive = false;
    if (this.pendingHide || this.pendingRender) {
      this.beginSlideOut();
    }
  }

  /**
   * Mark the PIP for hide. If the viewer is still mid-animation, the
   * slide-out is deferred until `handleViewerAnimationsComplete` fires.
   * Otherwise the slide-out begins immediately and `clearPipContents` runs
   * when the CSS transition completes.
   */
  requestHide() {
    this.pendingHide = true;
    this.pendingRender = null;
    if (this.viewerActive) {
      return;
    }
    this.beginSlideOut();
  }

  /**
   * Begin sliding the PIP out of the viewport by removing `mod-visible`,
   * which lets the CSS transition the active side anchor back to its
   * off-screen rest position. The completion handler runs from
   * `transitionend` (or the fallback timer) and decides whether to clear
   * the PIP or render the pending struct.
   */
  beginSlideOut() {
    const container = this.getContainer();
    if (!container) {
      this.handleSlideOutComplete();
      return;
    }
    if (this.slideOutHandler) {
      // A slide-out is already in flight; its completion handler will pick
      // up the latest `pendingHide` / `pendingRender` state.
      return;
    }
    if (!container.classList.contains('mod-visible')) {
      // PIP is already off-screen (e.g. the user scrolled the active
      // struct's tile back into view, or the PIP never became visible),
      // so no transition will fire. Skip straight to the post-work.
      this.handleSlideOutComplete();
      return;
    }
    this.attachSlideOutListener(container);
    container.classList.remove('mod-visible');
  }

  /**
   * Attach a one-shot `transitionend` listener to the PIP container plus a
   * fallback `setTimeout`. Whichever fires first wins; the other is cleared
   * in `detachSlideOutListener`.
   *
   * @param {HTMLElement} container
   */
  attachSlideOutListener(container) {
    this.detachSlideOutListener();

    const handler = (e) => {
      // Ignore bubbled transitions from child elements and from properties
      // other than the slide axes; only `left`/`right` move the PIP.
      if (e.target !== container) {
        return;
      }
      if (e.propertyName !== 'left' && e.propertyName !== 'right') {
        return;
      }
      this.detachSlideOutListener();
      this.handleSlideOutComplete();
    };
    this.slideOutHandler = handler;
    container.addEventListener('transitionend', handler);

    this.slideOutTimeout = setTimeout(() => {
      if (this.slideOutHandler) {
        this.detachSlideOutListener();
        this.handleSlideOutComplete();
      }
    }, SLIDE_OUT_FALLBACK_MS);
  }

  detachSlideOutListener() {
    const container = this.getContainer();
    if (container && this.slideOutHandler) {
      container.removeEventListener('transitionend', this.slideOutHandler);
    }
    this.slideOutHandler = null;
    if (this.slideOutTimeout !== null) {
      clearTimeout(this.slideOutTimeout);
      this.slideOutTimeout = null;
    }
  }

  /**
   * Slide-out has finished. Apply whichever post-work the current state
   * implies: clear (hide pending) or render-then-slide-in (swap pending).
   * If both are set the hide wins, matching the user-facing semantics that
   * "no continuation" always trumps a queued swap.
   */
  handleSlideOutComplete() {
    if (this.pendingHide) {
      this.pendingHide = false;
      this.pendingRender = null;
      this.clearPipContents();
      return;
    }
    if (this.pendingRender) {
      const next = this.pendingRender;
      this.pendingRender = null;
      const rendered = this.renderForStruct(
        next.structId,
        next.tileElement,
        next.animationEvent
      );
      if (rendered) {
        this.slideIn();
      } else {
        this.clearPipContents();
      }
    }
  }

  /**
   * Force a layout flush so the browser commits the (just-swapped) side
   * class's off-screen anchor before `mod-visible` is added, then delegate
   * to `updateVisibility` to add `mod-visible` if (and only if) the active
   * struct's tile is fully off the user's viewport.
   *
   * Without the reflow, the browser would batch the side-class swap with
   * the subsequent `mod-visible` add, see only the final on-screen anchor,
   * and skip the slide-in transition entirely.
   */
  slideIn() {
    const container = this.getContainer();
    if (!container) {
      return;
    }
    // Reading `offsetWidth` forces a synchronous layout, committing the
    // off-screen state established by `renderForStruct` so the subsequent
    // `mod-visible` add actually animates `left`/`right`.
    // eslint-disable-next-line no-unused-expressions
    container.offsetWidth;
    this.updateVisibility();
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
      this.activeViewer.onAnimationsComplete = null;
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
    this.activeViewer.onAnimationsComplete = () => this.handleViewerAnimationsComplete();

    const structSlot = container.querySelector('.map-pip-struct');
    MapStructLayerComponent.mountStructViewerInTile(structSlot, this.activeViewer, animationEvent);

    this.activeStructId = structId;
    this.viewerActive = true;
    this.pendingHide = false;

    return true;
  }

  /**
   * Update the PIP's visibility class based on whether the active struct's
   * tile is fully off-screen. Called on animation events, scroll, and resize.
   *
   * Skipped while a slide-out for a pending swap or hide is in progress so
   * the in-flight transition isn't clobbered by an unrelated scroll/resize.
   */
  updateVisibility() {
    if (this.pendingRender || this.pendingHide) {
      return;
    }
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
   *  - non-attack-sequence: request the PIP slide out and clear
   *  - empty PIP: render the new struct and slide it in
   *  - same struct (e.g. counter-attack chaining additional animations on
   *    the struct the PIP is already mirroring): re-render contents in
   *    place; the PIP stays on its current side and visibility is unchanged
   *  - different struct: queue the new render and slide the current struct
   *    out first; the new render and slide-in happen in
   *    `handleSlideOutComplete` once the transition (and, if it was still
   *    playing, the PIP's current animation) has finished
   *
   * @param {AnimationEvent|Event} event
   */
  handleAnimation(event) {
    if (
      !event
      || !event.structId
      || (event.mapId && event.mapId !== this.mapId)
    ) {
      return;
    }

    if (!AttackSequenceAnimationUtil.includesAttackSequenceAnimation(event.animationNames || [])) {
      if (this.activeStructId || this.pendingRender) {
        this.requestHide();
      }
      return;
    }

    const tileElement = this.findTileElement(event.structId);
    if (!tileElement) {
      return;
    }

    if (!this.activeStructId) {
      const rendered = this.renderForStruct(event.structId, tileElement, event);
      if (rendered) {
        this.slideIn();
      }
      return;
    }

    if (this.activeStructId === event.structId) {
      this.renderForStruct(event.structId, tileElement, event);
      return;
    }

    this.pendingRender = {
      structId: event.structId,
      tileElement: tileElement,
      animationEvent: event,
    };
    this.pendingHide = false;
    if (this.viewerActive) {
      // Wait for the PIP's current animation to finish first;
      // `handleViewerAnimationsComplete` will kick off the slide-out.
      return;
    }
    this.beginSlideOut();
  }

  /**
   * The global `AnimationEventQueue` just transitioned to idle. If the PIP
   * is still tracking a struct, request a hide; the actual hide is deferred
   * until the PIP's current animation finishes playing and then a slide-out
   * is performed.
   */
  handleAnimationQueueEmpty() {
    if (this.activeStructId) {
      this.requestHide();
    }
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
    this.addEventListenerTracked(EVENTS.ANIMATION_QUEUE_EMPTY, () => this.handleAnimationQueueEmpty());

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
    this.detachSlideOutListener();
    for (let i = 0; i < this.windowEventHandlers.length; i++) {
      const {target, event, handler} = this.windowEventHandlers[i];
      target.removeEventListener(event, handler);
    }
    this.windowEventHandlers = [];

    this.clearPipContents();
  }
}
