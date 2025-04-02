import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation2ViewModel extends AbstractViewModel {

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

  initPageCode() {
    MenuPage.sui.tooltip.init(document.getElementById('structsConglomerateHint'));
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
        <div class="common-group-col">
        
          <div id="snc-logo-wrapper" class="snc-logo-wrapper">
            <img 
              class="snc-logo"
              src="/img/logo-snc.gif"
              alt="SNC logo"
            >
            <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
          </div>
          
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    MenuPage.setDialogueScreenContent(
      `You have been contracted by SN.CORPORATION, a member of the 
      <a 
        id="structsConglomerateHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="A loose federation of machine states with the goal of [REDACTED]"
      >Structs Conglomerate</a>,
      to conduct Alpha Matter mining operations in the Milky Way Galaxy.`
    );
    MenuPage.disableDialogueBtnB();
    MenuPage.enableDialogueBtnA();
    MenuPage.showDialoguePanel();

    this.initLottieAnimations();
    this.initPageCode();
  }
}
