import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

/**
 * A full-screen status message, used for the tutorial's "Simulation loading..."
 * and "FTL Jump in Progress." screens.
 */
export class TutorialStatusViewModel extends AbstractViewModel {

  /**
   * @param {string} navLabel
   * @param {string} message
   * @param {string} imageSrc
   * @param {string} imageAlt
   * @param {boolean} startWithScanLines
   */
  constructor(
    navLabel,
    message,
    imageSrc = '/img/loading.gif',
    imageAlt = 'Computer connecting to SN.C',
    startWithScanLines = false
  ) {
    super();
    this.navLabel = navLabel;
    this.message = message;
    this.imageSrc = imageSrc;
    this.imageAlt = imageAlt;
    this.startWithScanLines = startWithScanLines;
  }

  initScanLines() {
    const {lottie} = window;
    if (!this.startWithScanLines || !lottie) {
      return;
    }
    const scanLines = lottie.loadAnimation({
      container: document.getElementById('lottie-scan-lines'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/lottie/transition-scan-lines/data.json'
    });
    scanLines.addEventListener('complete', () => {
      document.getElementById('lottie-scan-lines')?.classList.add('hidden');
    });
  }

  render() {
    MenuPage.setNavItems([
      new NavItemDTO(
        'nav-item-text-only',
        this.navLabel
      )
    ]);
    MenuPage.disableCloseBtn();
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="lottie-scan-lines-wrapper" class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>
      <div class="common-layout-col">
        <div class="common-group-col">
          <img id="computer-connecting-animation" class="tutorial-status-animation" src="${this.imageSrc}" alt="${this.imageAlt}">
        </div>
      </div>
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-warning"></i>`);
    MenuPage.setDialogueScreenContent(this.message);
    MenuPage.clearDialogueBtnAHandler();
    MenuPage.clearDialogueBtnBHandler();
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
    MenuPage.showDialoguePanel();
    MenuPage.open();

    this.initScanLines();
  }
}
