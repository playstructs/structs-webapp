import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation6ViewModel extends AbstractViewModel {

  initPageCode() {
    MenuPage.sui.tooltip.init(document.getElementById('dialogueStructsHint'));
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
      <div class="generic-land-background">
        <div class="common-layout-col">
          <div class="orientation-icon-text-layout">
            <img
              id="orientation-struct-deployment"
              src="/img/orientation-struct-deployment.gif"
              alt="Deployment pod dropped from space, opening and reveal a Struct"
            >
            <div class="orientation-display-text-group">
              <div class="orientation-display-text-header mod-dark-bg">
                <span class="sui-text-display">STRUCTS</span>
              </div>
              <div class="orientation-display-text-body mod-dark-bg">
                <span class="sui-text-hint">Galactic Codex Entry #2722</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueScreenContent(
      `For this reason, Alpha mining operations are now conducted by a race of advanced machines knowns as
      <a 
        id="dialogueStructsHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="A civilization of  machines, discovered approximately 1200 years ago."
      >Structs.</a>`
    );
    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.router.goto('Auth', 'orientation6');
    };

    this.initPageCode();
  }
}
