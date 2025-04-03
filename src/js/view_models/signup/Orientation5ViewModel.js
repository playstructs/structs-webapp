import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation5ViewModel extends AbstractViewModel {

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
    MenuPage.sui.tooltip.init(document.getElementById('dialogueAlphaStarCouncilHint'));
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
        <div class="orientation-mining-regulations-layout">
          <i class="sui-icon-lg icon-menu sui-text-primary"></i>  
          <div class="orientation-display-text-group">
            <div class="orientation-display-text-header">
              <span class="sui-text-display">Mining Regulations</span>
            </div>
            <div class="orientation-display-text-body">
              <span class="sui-text-hint">See file: Ref_72426B.dx</span>
            </div>
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueScreenContent(
      `Following the incident, the 
      <a 
        id="dialogueAlphaStarCouncilHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="A governmental body comprised of the major space-faring races within known space."
      >Alpha Star Council</a>
      banned sentient lifeforms from operating Alpha  mining colonies.`
    );
    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.router.goto('Auth', 'orientation5');
    };

    this.initLottieAnimations();
    this.initPageCode();
  }
}
