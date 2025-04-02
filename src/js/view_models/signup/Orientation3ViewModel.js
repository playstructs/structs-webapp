import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation3ViewModel extends AbstractViewModel {

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

    scanLines.addEventListener('complete', () => {
      document.getElementById('lottie-scan-lines').classList.add('hidden');
    });
  }

  initPageCode() {
    MenuPage.sui.tooltip.init(document.getElementById('dialogueAlphaMatterHint'));
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
        
      <div class="common-layout-col">
        <div class="orientation-alpha-layout">
          <div class="alpha-matter-128"></div>
          <div class="orientation-alpha-text-group">
            <div class="orientation-alpha-text-header">
              <span class="sui-text-display">Alpha Matter</span>
            </div>
            <div class="orientation-alpha-text-body">
              <span class="sui-text-hint">Ap - 52.456u</span>
            </div>
          </div>
          
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueScreenContent(
      `<a 
        id="dialogueAlphaMatterHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="Alpha Matter fuels faster-than-light travel and provides power to the galaxy."
      >Alpha Matter</a>
      is a rare and powerful substance that fuels galactic civilization. Unfortunately, it is dangerously unstable.`
    );

    this.initLottieAnimations();
    this.initPageCode();
  }
}
