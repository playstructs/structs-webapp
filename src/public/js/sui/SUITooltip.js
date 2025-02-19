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
   * @param {HTMLElement} trigger
   * @return {HTMLDivElement}
   */
  buildTooltipHTML(trigger) {
    const div = document.createElement('div');
    div.id = `${trigger.id}-message`;
    div.classList.add('sui-tooltip');
    div.innerHTML = trigger.dataset.suiTooltip;
    return div;
  }

  /**
   * @param {HTMLElement} tooltipHtmlElement
   */
  clearPointerPressedTimer(tooltipHtmlElement) {
    tooltipHtmlElement.classList.remove('sui-mod-show');
    clearTimeout(SUITooltip.pointerPressedTimer);
  }

  /**
   * @param {HTMLElement} tooltipElm
   * @param {HTMLElement} tooltipTriggerElm
   */
  pointerPressed(tooltipElm, tooltipTriggerElm) {
    clearTimeout(SUITooltip.pointerPressedTimer);

    SUITooltip.pointerPressedTimer = setTimeout(function() {
      tooltipElm.classList.add('sui-mod-show');

      tooltipElm.style.position = 'absolute';
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
  init() {
    let tooltips = document.querySelectorAll('[data-sui-tooltip]');

    if (tooltips.length === 0) {
      return;
    }

    tooltips.forEach(tooltipTrigger => {

      const tooltipElm = this.buildTooltipHTML(tooltipTrigger);
      tooltipTrigger.parentElement.appendChild(tooltipElm);

      // To position the tooltip the parent also must have position defined.
      if (!tooltipTrigger.parentElement.style.position) {
        tooltipTrigger.parentElement.style.position = 'relative';
      }

      let pressedEvent = 'mousedown';
      let releasedEvent = 'mouseup';

      // Attach relevant pointer event listeners for mobile or desktop
      if(window.matchMedia("(pointer: coarse)").matches) {
        pressedEvent = 'touchstart';
        releasedEvent = 'touchend';

        // Press and hold on mobile also fires a contextmenu event which we need to block
        // because it can obscure the tooltip and also cause inadvertent actions.
        tooltipTrigger.addEventListener("contextmenu", (event) => {
          event.preventDefault();
        }, { passive: false });

      }

      tooltipTrigger.addEventListener(pressedEvent, function() {
        this.pointerPressed(tooltipElm, tooltipTrigger);
      }.bind(this), { passive: true });

      window.addEventListener(releasedEvent, function () {
        this.clearPointerPressedTimer(tooltipElm);
      }.bind(this), { passive: true });

    });
  }
}
