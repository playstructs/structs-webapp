import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {TutorialMode} from "../../tutorial/TutorialMode";

export class OrientationEndViewModel extends AbstractViewModel {

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
    document.getElementById('launchTutorial').addEventListener('click', () => {
      TutorialMode.launch();
    });
    document.getElementById('skipTutorial').addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'skipTutorialConfirm');
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
        
      <div class="common-layout-col">
        <div><i class="sui-icon-lg icon-incoming sui-text-primary"></i> File Received.</div>
        <div class="common-btn-sizing-container tutorial-choice-btns">
          <div class="sui-screen-btn-flex-wrapper">
            <a id="launchTutorial" href="javascript: void(0)" class="sui-screen-btn sui-mod-primary">Launch Tutorial</a>
          </div>
          <div class="sui-screen-btn-flex-wrapper">
            <a id="skipTutorial" href="javascript: void(0)" class="sui-screen-btn sui-mod-secondary">Skip Tutorial</a>
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    MenuPage.setDialogueScreenContent(
      `Due to increased pirate activity in the frontier regions, SN.CORP recommends all new employees undergo Combat Training.`
    );
    MenuPage.clearDialogueBtnAHandler();
    MenuPage.clearDialogueBtnBHandler();
    MenuPage.disableDialogueBtnA();
    MenuPage.disableDialogueBtnB();

    this.initLottieAnimations();
    this.initPageCode();
  }
}
