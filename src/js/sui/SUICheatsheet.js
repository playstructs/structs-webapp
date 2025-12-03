import {SUIFeature} from "./SUIFeature.js";
import {SUIUtil} from "./SUIUtil.js";

export class SUICheatsheet extends SUIFeature {

  /**
   * Used to track how long the mouse or touch screen is pressed.
   *
   * @type {number|null} a timeout ID
   */
  static pointerPressedTimer = null;

  constructor() {
    super();
    this.util = new SUIUtil();

    /** @type {SUICheatsheetContentBuilder} */
    this.contentBuilder = null;
  }

  /**
   * @param {SUICheatsheetContentBuilder} contentBuilder
   */
  setContentBuilder(contentBuilder) {
    this.contentBuilder = contentBuilder;
  }

  /**
   * @param {HTMLElement} cheatsheetElm
   */
  clearPointerPressedTimer(cheatsheetElm) {

    // If there is an existing cheatsheet, remove it.
    if (cheatsheetElm.parentElement) {
      cheatsheetElm.parentElement.removeChild(cheatsheetElm);
    }

    clearTimeout(SUICheatsheet.pointerPressedTimer);
  }

  /**
   * @param {HTMLElement} cheatsheetElm
   * @param {HTMLElement} cheatsheetTriggerElm
   */
  pointerPressed(cheatsheetElm, cheatsheetTriggerElm) {
    clearTimeout(SUICheatsheet.pointerPressedTimer);

    // If there is an existing cheatsheet, remove it.
    if (cheatsheetElm.parentElement) {
      cheatsheetElm.parentElement.removeChild(cheatsheetElm);
    }

    SUICheatsheet.pointerPressedTimer = setTimeout(function() {

      // To position the cheatsheet the parent also must have position defined.
      const parentStyle = getComputedStyle(cheatsheetTriggerElm.parentElement);
      if (parentStyle.getPropertyValue('position') === 'static') {
        cheatsheetTriggerElm.parentElement.style.position = 'relative';
      }

      // Add the cheatsheet to the triggering element's parent, so that the cheatsheet stays relative to the target.
      cheatsheetTriggerElm.parentElement.appendChild(cheatsheetElm);

      // Use the triggering elements data attribute as key to which cheatsheet to show.
      cheatsheetElm.innerHTML = this.contentBuilder.build({...cheatsheetTriggerElm.dataset});

      this.util.horizontallyCenter(cheatsheetElm, cheatsheetTriggerElm);

      if (cheatsheetTriggerElm.dataset.suiModPlacement === 'bottom') {
        this.util.positionBelow(cheatsheetElm, cheatsheetTriggerElm);
      } else {
        this.util.positionAbove(cheatsheetElm, cheatsheetTriggerElm);
      }

    }.bind(this), 100);
  }

  /**
   * Initialize all cheatsheets on the page.
   */
  autoInitAll() {

    const cheatsheetElm = document.createElement('div');
    cheatsheetElm.id = `sui-cheatsheet-container`;
    cheatsheetElm.classList.add('sui-cheatsheet');
    cheatsheetElm.style.position = 'absolute';

    let pressedEvent = 'mousedown';
    let releasedEvent = 'mouseup';

    if (window.matchMedia("(pointer: coarse)").matches) {
      pressedEvent = 'touchstart';
      releasedEvent = 'touchend';

      // Press and hold on mobile also fires a contextmenu event which we need to block
      // because it can obscure the cheatsheet and also cause inadvertent actions.
      document.body.addEventListener('contextmenu', (e) => {
        if (e.target.closest('[data-sui-cheatsheet]')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.body.addEventListener(pressedEvent, function (e) {
      const cheatsheetTriggerElm = e.target.closest('[data-sui-cheatsheet]');
      if (cheatsheetTriggerElm) {
        this.pointerPressed(cheatsheetElm, cheatsheetTriggerElm);
      }
    }.bind(this), { passive: true });

    window.addEventListener(releasedEvent, function () {
      this.clearPointerPressedTimer(cheatsheetElm);
    }.bind(this), { passive: true });
  }
}
