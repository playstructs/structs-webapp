import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation4ViewModel extends AbstractViewModel {

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
    const hoagExplosion = loadAnimation({
      container: document.getElementById('lottie-hoag-explosion'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/lottie/hoag-explosion/data.json'
    });

    setTimeout(() => {
      hoagExplosion.play();
    }, 1000);

    scanLines.addEventListener('complete', () => {
      document.getElementById('lottie-scan-lines').classList.add('hidden');
    });
  }

  initPageCode() {
    MenuPage.sui.tooltip.init(document.getElementById('catastrophicLossHint'));
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
          <div id="lottie-hoag-explosion-wrapper">
            <div id="lottie-hoag-explosion"></div>
            <div class="hoag-planet-label-box">
              Trydor,<br>
              <span class="sui-text-secondary">Hoag System</span>
            </div>
          </div>
        </div>
      </div>  
    </div>
    `);

    MenuPage.setDialogueScreenContent(
      `Improper handling of Alpha Matter during the Hoag Incident resulted in 
      <a 
        id="catastrophicLossHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="SN.CORP accepts no responsibility for employees obliterated by Alpha Matter Space Distortion Fields."
      >catastrophic loss of life.</a>`
    );

    this.initLottieAnimations();
    this.initPageCode();
  }
}
