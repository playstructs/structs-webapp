/** Movement in CSS pixels before a press counts as a pan rather than a click. */
const DRAG_THRESHOLD_PX = 5;

/** Applied to the body for the duration of a pan. */
const PANNING_CLASS = 'is-map-panning';

/**
 * Click-and-drag panning for the maps, so a mouse without a horizontal wheel
 * can still reach the far side of a planet.
 *
 * The maps are absolutely positioned children of the body rather than scroll
 * containers of their own, so the window is the scroller and a pan is only a
 * scroll. One instance serves every map: the listeners live on the document, so
 * they are unaffected by the re-renders that rebuild the map DOM.
 */
export class MapPanController {

  constructor() {
    /** @type {?number} The pointer being tracked, if a press landed on a map. */
    this.pointerId = null;

    /** @type {boolean} Whether that press has passed the drag threshold. */
    this.panning = false;

    /** @type {boolean} Whether the click ending this press should be discarded. */
    this.suppressClick = false;

    this.originX = 0;
    this.originY = 0;
    this.lastX = 0;
    this.lastY = 0;
  }

  init() {
    document.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
    document.addEventListener('pointermove', (event) => this.handlePointerMove(event));
    document.addEventListener('pointerup', (event) => this.handlePointerUp(event));
    document.addEventListener('pointercancel', (event) => this.handlePointerUp(event));

    // Capture phase, so a click that was really the end of a pan is stopped
    // before it reaches the tile listeners.
    document.addEventListener('click', (event) => this.handleClick(event), true);

    document.addEventListener('dragstart', (event) => this.handleDragStart(event));
  }

  /**
   * @param {PointerEvent} event
   */
  handlePointerDown(event) {
    // A fresh press voids any suppression left by a pan that ended without a
    // click, which is what happens when the button is released off-window.
    this.suppressClick = false;

    // Touch and pen already pan by dragging; this is for the mouse, which
    // cannot pan horizontally at all without the right hardware.
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    // One test excludes everything that is not a map. The HUD, the menu, the
    // dialogues and the picture-in-picture all live outside the containers.
    if (!(event.target instanceof Element) || !event.target.closest('.map-container')) {
      return;
    }

    this.pointerId = event.pointerId;
    this.originX = event.clientX;
    this.originY = event.clientY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  /**
   * @param {PointerEvent} event
   */
  handlePointerMove(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    if (!this.panning) {
      if (!this.hasPassedThreshold(event)) {
        return;
      }

      this.startPanning();
    }

    // Scrolling against the pointer delta is what makes the map track the
    // cursor. Both are viewport pixels, so the two stay 1:1 even under the
    // breakpoints that scale the map containers by 2x and 4x.
    window.scrollBy(this.lastX - event.clientX, this.lastY - event.clientY);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  /**
   * @param {PointerEvent} event
   * @return {boolean}
   */
  hasPassedThreshold(event) {
    return Math.abs(event.clientX - this.originX) >= DRAG_THRESHOLD_PX
      || Math.abs(event.clientY - this.originY) >= DRAG_THRESHOLD_PX;
  }

  startPanning() {
    this.panning = true;
    document.body.classList.add(PANNING_CLASS);

    // Without capture, a release outside the window is never delivered and the
    // pan would carry on against a button the player has already let go of.
    document.documentElement.setPointerCapture(this.pointerId);

    // The pixels spent reaching the threshold may already have begun a
    // selection, which would then drag along under the cursor.
    window.getSelection()?.removeAllRanges();
  }

  /**
   * @param {PointerEvent} event
   */
  handlePointerUp(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    if (this.panning) {
      document.body.classList.remove(PANNING_CLASS);
      document.documentElement.releasePointerCapture(this.pointerId);

      // The click closing this press belongs to the pan, not to whichever tile
      // the cursor happens to be resting on. A cancelled pointer is not
      // followed by a click, so arming the flag there would leave it set.
      this.suppressClick = event.type === 'pointerup';
    }

    this.pointerId = null;
    this.panning = false;
  }

  /**
   * @param {MouseEvent} event
   */
  handleClick(event) {
    if (!this.suppressClick) {
      return;
    }

    this.suppressClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Tiles are anchors, which browsers drag natively. Left alone, the ghost
   * image appears as soon as a pan crosses one. Native dragging can begin
   * before the threshold, so this covers the whole press rather than only the
   * part of it spent panning.
   *
   * @param {DragEvent} event
   */
  handleDragStart(event) {
    if (this.pointerId !== null) {
      event.preventDefault();
    }
  }
}
