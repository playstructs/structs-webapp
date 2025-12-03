export class SUIUtil {
  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  positionAbove(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If dynamic element would end up offscreen, place it below
    if (
      originRect.top < dynamicElm.offsetHeight
      && (window.innerHeight - originRect.bottom) >= dynamicElm.offsetHeight
    ) {
      this.positionBelow(dynamicElm, originElm);
    } else {
      dynamicElm.style.top = `${originElm.offsetTop - dynamicElm.offsetHeight}px`;
    }
  }

  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  positionBelow(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If dynamic element would end up offscreen, place it above
    if (
      (window.innerHeight - originRect.bottom) < dynamicElm.offsetHeight
      && originRect.top > dynamicElm.offsetHeight
    ) {
      this.positionAbove(dynamicElm, originElm);
    } else {
      dynamicElm.style.top = `${originElm.offsetTop + originElm.offsetHeight}px`;
    }
  }

  /**
   * @param {HTMLElement} dynamicElm
   * @param {HTMLElement} originElm
   */
  horizontallyCenter(dynamicElm, originElm) {
    const originRect = originElm.getBoundingClientRect();

    // If the dynamic element will go offscreen on the left,
    // align the dynamic element up to the left edge.
    if (originRect.left - (originElm.offsetWidth / 2) < dynamicElm.offsetWidth / 2) {
      dynamicElm.style.left = `${originElm.offsetLeft}px`;

    // If the dynamic element will go offscreen on the right,
    // align the dynamic element up to the right edge.
    } else if ((originElm.offsetWidth / 2) + (window.innerWidth - originRect.right) < dynamicElm.offsetWidth / 2) {
      dynamicElm.style.left = `${(originElm.offsetLeft + originElm.offsetWidth) - dynamicElm.offsetWidth}px`;

    } else {
      dynamicElm.style.left = `${originElm.offsetLeft - (dynamicElm.offsetWidth - originElm.offsetWidth) / 2}px`;
    }
  }

  /**
   * Position element above the origin using fixed positioning (viewport-relative).
   * Falls back to below if there's not enough space above.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  positionAboveFixed(dynamicElm, originRect) {
    // If dynamic element would go offscreen above, place it below instead
    if (
      originRect.top < dynamicElm.offsetHeight
      && (window.innerHeight - originRect.bottom) >= dynamicElm.offsetHeight
    ) {
      this.positionBelowFixed(dynamicElm, originRect);
    } else {
      dynamicElm.style.top = `${originRect.top - dynamicElm.offsetHeight}px`;
    }
  }

  /**
   * Position element below the origin using fixed positioning (viewport-relative).
   * Falls back to above if there's not enough space below.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  positionBelowFixed(dynamicElm, originRect) {
    // If dynamic element would go offscreen below, place it above instead
    if (
      (window.innerHeight - originRect.bottom) < dynamicElm.offsetHeight
      && originRect.top > dynamicElm.offsetHeight
    ) {
      this.positionAboveFixed(dynamicElm, originRect);
    } else {
      dynamicElm.style.top = `${originRect.bottom}px`;
    }
  }

  /**
   * Horizontally center element relative to origin using fixed positioning (viewport-relative).
   * Adjusts to keep element within viewport bounds.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  horizontallyCenterFixed(dynamicElm, originRect) {
    const dynamicWidth = dynamicElm.offsetWidth;
    const originCenterX = originRect.left + (originRect.width / 2);
    let leftPos = originCenterX - (dynamicWidth / 2);

    // If element would go offscreen on the left, align to left edge
    if (leftPos < 0) {
      leftPos = originRect.left;

    // If element would go offscreen on the right, align to right edge
    } else if (leftPos + dynamicWidth > window.innerWidth) {
      leftPos = originRect.right - dynamicWidth;
    }

    dynamicElm.style.left = `${leftPos}px`;
  }
}
