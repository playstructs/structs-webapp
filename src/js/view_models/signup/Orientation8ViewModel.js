import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

const CMD_SHIP_BASE_SRC = '/img/structs/cmd-ship/cmd-ship-struct-base.png';
const CMD_SHIP_WEAPON_SRC = '/img/structs/cmd-ship/cmd-ship-top-weapon.png';

/** Lets the scan-line transition clear before the ship warps in. */
const WARP_ARRIVAL_DELAY_MS = 600;

export class Orientation8ViewModel extends AbstractViewModel {

  /**
   * Plays the in-game warp arrival with the CMD Ship's sprites, the same
   * animation the map uses when a fleet arrives.
   */
  initWarpArrival() {
    const container = document.getElementById('orientation-cmd-ship-warp');
    const still = document.getElementById('orientation-cmd-ship-still');
    const showStill = () => {
      container.classList.add('hidden');
      still.classList.remove('hidden');
    };

    const {lottie} = window;
    if (!lottie) {
      showStill();
      return;
    }

    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/lottie/move_arrive/data.json'
    });

    const swapImage = (targetClass, src) => {
      const original = container.querySelector(`g g${targetClass} image`);
      if (!original) {
        return;
      }
      const group = original.parentNode;
      const width = original.width.baseVal.valueAsString;
      const height = original.height.baseVal.valueAsString;
      group.innerHTML = '';
      if (!src) {
        return;
      }
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttributeNS(null, 'width', width);
      image.setAttributeNS(null, 'height', height);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
      group.append(image);
    };

    animation.addEventListener('DOMLoaded', () => {
      swapImage('.struct_init', CMD_SHIP_BASE_SRC);
      swapImage('.struct_top_layer_1', CMD_SHIP_WEAPON_SRC);
      swapImage('.struct_top_layer_2', null);
      swapImage('.struct_dmg', null);
      swapImage('.struct_bottom_layer_1', null);
      setTimeout(() => animation.play(), WARP_ARRIVAL_DELAY_MS);
    });
    animation.addEventListener('complete', showStill);
    animation.addEventListener('data_failed', showStill);
  }

  initLottieAnimations() {
    const {lottie} = window;
    const {loadAnimation} = lottie;
    const scanLines = loadAnimation({
      container: document.getElementById('lottie-scan-lines'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/lottie/transition-scan-lines/data.json'
    });
    loadAnimation({
      container: document.getElementById('hrbot-talking-small'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lottie/hr-bot/data.json'
    });

    scanLines.addEventListener('complete', () => {
      document.getElementById('lottie-scan-lines').classList.add('hidden');
    });
  }

  render() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn();
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">

      <div id="lottie-scan-lines-wrapper" class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>

      <div class="generic-space-background">
        <div class="common-layout-col">
          <div class="orientation-icon-text-layout">
            <div class="orientation-cmd-ship">
              <div id="orientation-cmd-ship-warp" class="orientation-cmd-ship-warp"></div>
              <div id="orientation-cmd-ship-still" class="hidden">
                <img src="${CMD_SHIP_BASE_SRC}" alt="ST-21 Spearpoint CMD Ship">
                <img src="${CMD_SHIP_WEAPON_SRC}" alt="">
              </div>
              <img class="orientation-cmd-ship-focus" src="/img/focus/focus-friendly.png" alt="">
            </div>
            <div class="orientation-display-text-group" style="min-width: 294px">
              <div class="orientation-display-text-header mod-dark-bg">
                <span class="sui-text-display">CMD SHIP</span>
              </div>
              <div class="orientation-display-text-body mod-dark-bg">
                <span class="sui-text-hint">ST-21 "Spearpoint"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    MenuPage.setDialogueScreenContent(
      `You have been issued a ST-21 "Spearpoint" CMD Ship to explore the uncharted regions for Alpha-seeded worlds.`
    );
    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.router.goto('Auth', 'orientationEnd');
    };
    MenuPage.disableDialogueBtnB();
    MenuPage.enableDialogueBtnA();
    MenuPage.showDialoguePanel();

    this.initLottieAnimations();
    this.initWarpArrival();
  }
}
