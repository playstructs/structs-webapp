import {SUIFeature} from "./SUIFeature.js";
import {SUIUtil} from "./SUIUtil.js";

export class SUITooltip extends SUIFeature {

  /**
   * Used to track how long the mouse or touch screen is pressed.
   *
   * @type {number|null} a timeout ID
   */
  static pointerPressedTimer = null;

  constructor() {
    super();
    this.util = new SUIUtil();
  }

  /**
   * @param {HTMLElement} tooltipHtmlElement
   */
  clearPointerPressedTimer(tooltipHtmlElement) {
    tooltipHtmlElement.classList.remove('sui-mod-show');

    // If there is an existing tooltip, remove it.
    if (tooltipHtmlElement.parentElement) {
      tooltipHtmlElement.parentElement.removeChild(tooltipHtmlElement);
    }

    clearTimeout(SUITooltip.pointerPressedTimer);
  }

  /**
   * @param {HTMLElement} tooltipElm
   * @param {HTMLElement} tooltipTriggerElm
   */
  pointerPressed(tooltipElm, tooltipTriggerElm) {
    clearTimeout(SUITooltip.pointerPressedTimer);

    // If there is an existing tooltip, remove it.
    if (tooltipElm.parentElement) {
      tooltipElm.parentElement.removeChild(tooltipElm);
    }

    SUITooltip.pointerPressedTimer = setTimeout(function() {

      // To position the tooltip the parent also must have position defined.
      const parentStyle = getComputedStyle(tooltipTriggerElm.parentElement);
      if (parentStyle.getPropertyValue('position') === 'static') {
        tooltipTriggerElm.parentElement.style.position = 'relative';
      }

      // Add the tooltip to the triggering element's parent, so that the tool tip stays relative to the target.
      tooltipTriggerElm.parentElement.appendChild(tooltipElm);

      // Set the tooltip content based on the triggering elements data attribute
      tooltipElm.innerHTML = tooltipTriggerElm.dataset.suiTooltip;

      // Show the tool tip
      tooltipElm.classList.add('sui-mod-show');

      this.util.horizontallyCenter(tooltipElm, tooltipTriggerElm);

      if (tooltipTriggerElm.dataset.suiModPlacement === 'bottom') {
        this.util.positionBelow(tooltipElm, tooltipTriggerElm);
      } else {
        this.util.positionAbove(tooltipElm, tooltipTriggerElm);
      }

    }.bind(this), 100);
  }

  /**
   * Initialize all tooltips on the page.
   */
  autoInitAll() {

    const tooltipElm = document.createElement('div');
    tooltipElm.id = `sui-tooltip-container`;
    tooltipElm.classList.add('sui-tooltip');
    tooltipElm.style.position = 'absolute';

    let pressedEvent = 'mousedown';
    let releasedEvent = 'mouseup';

    if (window.matchMedia("(pointer: coarse)").matches) {
      pressedEvent = 'touchstart';
      releasedEvent = 'touchend';

      // Press and hold on mobile also fires a contextmenu event which we need to block
      // because it can obscure the tooltip and also cause inadvertent actions.
      document.body.addEventListener('contextmenu', (e) => {
        if (e.target.parentElement.matches('[data-sui-tooltip]')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.body.addEventListener(pressedEvent, function (e) {
      if (e.target.matches('[data-sui-tooltip]')) {
        this.pointerPressed(tooltipElm, e.target);
      }
      if (e.target.parentElement.matches('[data-sui-tooltip]')) {
        this.pointerPressed(tooltipElm, e.target.parentElement);
      }

    }.bind(this), { passive: true });

    window.addEventListener(releasedEvent, function () {
      this.clearPointerPressedTimer(tooltipElm);
    }.bind(this), { passive: true });
  }
}
