import {SUIFeature} from "./SUIFeature.js";
import {SUIUtil} from "./SUIUtil.js";

export class SUICheatsheet extends SUIFeature {

  /**
   * Used to track how long the mouse or touch screen is pressed.
   *
   * @type {number|null} a timeout ID
   */
  static pointerPressedTimer = null;

  /**
   * Set to true once the long-press timer fires and the cheatsheet is
   * actually shown. Used to suppress the synthetic `click` event that
   * browsers fire on release, so that releasing a long-press is not
   * treated as a click on the underlying element (e.g. an action bar
   * button).
   *
   * @type {boolean}
   */
  static cheatsheetWasShown = false;

  static OPEN_DELAY = 500;

  constructor() {
    super();
    this.util = new SUIUtil();
    this.suiThemes = [
      'sui-theme-player',
      'sui-theme-enemy',
      'sui-theme-neutral'
    ];

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
    SUICheatsheet.cheatsheetWasShown = false;

    // If there is an existing cheatsheet, remove it.
    if (cheatsheetElm.parentElement) {
      cheatsheetElm.parentElement.removeChild(cheatsheetElm);
    }

    SUICheatsheet.pointerPressedTimer = setTimeout(function() {

      this.suiThemes.forEach(themeClass => {
        cheatsheetElm.classList.remove(themeClass);
      });

      if (cheatsheetTriggerElm.dataset.suiTheme) {
        cheatsheetElm.classList.add(`sui-theme-${cheatsheetTriggerElm.dataset.suiTheme}`);
      } else {
        cheatsheetElm.classList.add(this.suiThemes[0]);
      }

      // Append to body so cheatsheet is not clipped by ancestor overflow
      document.body.appendChild(cheatsheetElm);

      // Use the triggering elements data attribute as key to which cheatsheet to show.
      cheatsheetElm.innerHTML = this.contentBuilder.build({...cheatsheetTriggerElm.dataset});

      // Get viewport-relative coordinates for fixed positioning
      const triggerRect = cheatsheetTriggerElm.getBoundingClientRect();

      // Position cheatsheet in best fitting location (tries: top, right, bottom, left)
      this.util.positionBestFitFixed(cheatsheetElm, triggerRect);

      SUICheatsheet.cheatsheetWasShown = true;

    }.bind(this), SUICheatsheet.OPEN_DELAY);
  }

  /**
   * Initialize all cheatsheets on the page.
   */
  autoInitAll() {

    const cheatsheetElm = document.createElement('div');
    cheatsheetElm.id = `sui-cheatsheet-container`;
    cheatsheetElm.classList.add('sui-cheatsheet');
    cheatsheetElm.style.position = 'fixed';

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

    // Suppress the synthetic `click` event that follows the release of a
    // long-press, so that long-pressing an element to view its cheatsheet
    // does not also trigger that element's click handler. Capture phase is
    // used so we run before any handler attached directly to the trigger.
    document.body.addEventListener('click', function (e) {
      if (
        SUICheatsheet.cheatsheetWasShown
        && e.target.closest('[data-sui-cheatsheet]')
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Clear immediately on the success path so a subsequent quick
        // click on the same (or another) trigger is not also suppressed.
        SUICheatsheet.cheatsheetWasShown = false;
      }
    }, true);

    window.addEventListener(releasedEvent, function () {
      this.clearPointerPressedTimer(cheatsheetElm);
      // Fallback flag-clear in case no synthetic `click` follows the
      // release (e.g. touchcancel, user dragged off the trigger, or the
      // browser otherwise does not dispatch a click). The delay is long
      // enough to outlast platform synthetic-click latency (historically
      // up to ~300ms on touch) but short enough not to interfere with a
      // subsequent intentional tap.
      setTimeout(() => {
        SUICheatsheet.cheatsheetWasShown = false;
      }, 350);
    }.bind(this), { passive: true });
  }
}
