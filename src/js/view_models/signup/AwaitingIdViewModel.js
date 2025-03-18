import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class AwaitingIdViewModel extends AbstractViewModel{
  render() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn();
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
        
      <div class="common-layout-col">
        <div class="common-group-col">
          <img id="computer-connecting-animation" src="/img/loading.gif" alt="Computer connecting to SN.C">
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-warning"></i>`);
    MenuPage.setDialogueScreenContent(`Please wait while your Employee Record is confirmed...`);
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
    MenuPage.showDialoguePanel();
  }
}
