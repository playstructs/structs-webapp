import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class Orientation2ViewModel extends AbstractViewModel {

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

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">

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
    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.router.goto('Auth', 'orientation3');
    };

    this.initPageCode();
  }
}
