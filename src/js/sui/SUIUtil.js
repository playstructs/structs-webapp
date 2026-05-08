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
   * Read the effective uniform scale factor from an element's computed
   * `transform`. Returns 1 when no transform is applied (or it can't be parsed).
   *
   * The cheatsheet (and similar elements) opt in to viewport scaling via media
   * queries that apply `transform: scale(N)`. Their `style.top`/`style.left`
   * stay in unscaled (logical) pixel space, so positioning math has to use the
   * post-scale visual size to land correctly.
   *
   * @param {HTMLElement} elm
   * @return {number}
   */
  getEffectiveScale(elm) {
    const transform = window.getComputedStyle(elm).transform;
    if (!transform || transform === 'none') {
      return 1;
    }
    const match = transform.match(/matrix\(\s*([^,)]+)/);
    if (!match) {
      return 1;
    }
    const scale = parseFloat(match[1]);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  /**
   * Position element above the origin using fixed positioning (viewport-relative).
   * Falls back to below if there's not enough space above.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionAboveFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;

    // If dynamic element would go offscreen above, place it below instead
    if (
      originRect.top < visualHeight
      && (window.innerHeight - originRect.bottom) >= visualHeight
    ) {
      this.positionBelowFixed(dynamicElm, originRect, scale);
    } else {
      dynamicElm.style.top = `${originRect.top - visualHeight}px`;
    }
  }

  /**
   * Position element below the origin using fixed positioning (viewport-relative).
   * Falls back to above if there's not enough space below.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionBelowFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;

    // If dynamic element would go offscreen below, place it above instead
    if (
      (window.innerHeight - originRect.bottom) < visualHeight
      && originRect.top > visualHeight
    ) {
      this.positionAboveFixed(dynamicElm, originRect, scale);
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
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  horizontallyCenterFixed(dynamicElm, originRect, scale = 1) {
    const visualWidth = dynamicElm.offsetWidth * scale;
    const originCenterX = originRect.left + (originRect.width / 2);
    let leftPos = originCenterX - (visualWidth / 2);

    // If element would go offscreen on the left, align to left edge
    if (leftPos < 0) {
      leftPos = originRect.left;

    // If element would go offscreen on the right, align to right edge
    } else if (leftPos + visualWidth > window.innerWidth) {
      leftPos = originRect.right - visualWidth;
    }

    dynamicElm.style.left = `${leftPos}px`;
  }

  /**
   * Vertically center element relative to origin using fixed positioning (viewport-relative).
   * Adjusts to keep element within viewport bounds.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  verticallyCenterFixed(dynamicElm, originRect, scale = 1) {
    const visualHeight = dynamicElm.offsetHeight * scale;
    const originCenterY = originRect.top + (originRect.height / 2);
    let topPos = originCenterY - (visualHeight / 2);

    // If element would go offscreen on the top, align to top edge
    if (topPos < 0) {
      topPos = 0;

    // If element would go offscreen on the bottom, align to bottom edge
    } else if (topPos + visualHeight > window.innerHeight) {
      topPos = window.innerHeight - visualHeight;
    }

    dynamicElm.style.top = `${topPos}px`;
  }

  /**
   * Position element to the right of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionRightFixed(dynamicElm, originRect, scale = 1) {
    dynamicElm.style.left = `${originRect.right}px`;
    this.verticallyCenterFixed(dynamicElm, originRect, scale);
  }

  /**
   * Position element to the left of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale=1] visual scale factor applied to dynamicElm
   */
  positionLeftFixed(dynamicElm, originRect, scale = 1) {
    const visualWidth = dynamicElm.offsetWidth * scale;
    dynamicElm.style.left = `${originRect.left - visualWidth}px`;
    this.verticallyCenterFixed(dynamicElm, originRect, scale);
  }

  /**
   * Position element in the best fitting position relative to origin.
   * Tries positions in order: top, right, bottom, left.
   * Falls back to the side with the most available space.
   *
   * If `scale` is omitted it is read from the element's computed transform so
   * the math accounts for any media-query driven scaling applied to dynamicElm.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   * @param {number} [scale] visual scale factor applied to dynamicElm
   */
  positionBestFitFixed(dynamicElm, originRect, scale) {
    if (scale === undefined) {
      scale = this.getEffectiveScale(dynamicElm);
    }

    const visualWidth = dynamicElm.offsetWidth * scale;
    const visualHeight = dynamicElm.offsetHeight * scale;

    // Calculate available space on each side
    const spaceTop = originRect.top;
    const spaceRight = window.innerWidth - originRect.right;
    const spaceBottom = window.innerHeight - originRect.bottom;
    const spaceLeft = originRect.left;

    // Check if element fits on each side (in order: top, right, bottom, left)
    const fitsTop = spaceTop >= visualHeight;
    const fitsRight = spaceRight >= visualWidth;
    const fitsBottom = spaceBottom >= visualHeight;
    const fitsLeft = spaceLeft >= visualWidth;

    // Try positions in order: top, right, bottom, left
    if (fitsTop) {
      dynamicElm.style.top = `${originRect.top - visualHeight}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsRight) {
      this.positionRightFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsBottom) {
      dynamicElm.style.top = `${originRect.bottom}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect, scale);
      return;
    }

    if (fitsLeft) {
      this.positionLeftFixed(dynamicElm, originRect, scale);
      return;
    }

    // None fit - find the side with the most space
    const spaces = [
      { side: 'top', space: spaceTop },
      { side: 'right', space: spaceRight },
      { side: 'bottom', space: spaceBottom },
      { side: 'left', space: spaceLeft }
    ];

    spaces.sort((a, b) => b.space - a.space);
    const bestSide = spaces[0].side;

    switch (bestSide) {
      case 'top':
        dynamicElm.style.top = `${originRect.top - visualHeight}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect, scale);
        break;
      case 'right':
        this.positionRightFixed(dynamicElm, originRect, scale);
        break;
      case 'bottom':
        dynamicElm.style.top = `${originRect.bottom}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect, scale);
        break;
      case 'left':
        this.positionLeftFixed(dynamicElm, originRect, scale);
        break;
    }
  }
}
