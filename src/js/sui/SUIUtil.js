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

  /**
   * Vertically center element relative to origin using fixed positioning (viewport-relative).
   * Adjusts to keep element within viewport bounds.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  verticallyCenterFixed(dynamicElm, originRect) {
    const dynamicHeight = dynamicElm.offsetHeight;
    const originCenterY = originRect.top + (originRect.height / 2);
    let topPos = originCenterY - (dynamicHeight / 2);

    // If element would go offscreen on the top, align to top edge
    if (topPos < 0) {
      topPos = 0;

    // If element would go offscreen on the bottom, align to bottom edge
    } else if (topPos + dynamicHeight > window.innerHeight) {
      topPos = window.innerHeight - dynamicHeight;
    }

    dynamicElm.style.top = `${topPos}px`;
  }

  /**
   * Position element to the right of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  positionRightFixed(dynamicElm, originRect) {
    dynamicElm.style.left = `${originRect.right}px`;
    this.verticallyCenterFixed(dynamicElm, originRect);
  }

  /**
   * Position element to the left of the origin using fixed positioning (viewport-relative).
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  positionLeftFixed(dynamicElm, originRect) {
    dynamicElm.style.left = `${originRect.left - dynamicElm.offsetWidth}px`;
    this.verticallyCenterFixed(dynamicElm, originRect);
  }

  /**
   * Position element in the best fitting position relative to origin.
   * Tries positions in order: top, right, bottom, left.
   * Falls back to the side with the most available space.
   *
   * @param {HTMLElement} dynamicElm
   * @param {DOMRect} originRect
   */
  positionBestFitFixed(dynamicElm, originRect) {
    const dynamicWidth = dynamicElm.offsetWidth;
    const dynamicHeight = dynamicElm.offsetHeight;

    // Calculate available space on each side
    const spaceTop = originRect.top;
    const spaceRight = window.innerWidth - originRect.right;
    const spaceBottom = window.innerHeight - originRect.bottom;
    const spaceLeft = originRect.left;

    // Check if element fits on each side (in order: top, right, bottom, left)
    const fitsTop = spaceTop >= dynamicHeight;
    const fitsRight = spaceRight >= dynamicWidth;
    const fitsBottom = spaceBottom >= dynamicHeight;
    const fitsLeft = spaceLeft >= dynamicWidth;

    // Try positions in order: top, right, bottom, left
    if (fitsTop) {
      dynamicElm.style.top = `${originRect.top - dynamicHeight}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect);
      return;
    }

    if (fitsRight) {
      this.positionRightFixed(dynamicElm, originRect);
      return;
    }

    if (fitsBottom) {
      dynamicElm.style.top = `${originRect.bottom}px`;
      this.horizontallyCenterFixed(dynamicElm, originRect);
      return;
    }

    if (fitsLeft) {
      this.positionLeftFixed(dynamicElm, originRect);
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
        dynamicElm.style.top = `${originRect.top - dynamicHeight}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect);
        break;
      case 'right':
        this.positionRightFixed(dynamicElm, originRect);
        break;
      case 'bottom':
        dynamicElm.style.top = `${originRect.bottom}px`;
        this.horizontallyCenterFixed(dynamicElm, originRect);
        break;
      case 'left':
        this.positionLeftFixed(dynamicElm, originRect);
        break;
    }
  }
}
