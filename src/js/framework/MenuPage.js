import {MenuPageRouter} from "./MenuPageRouter";
import {NavItemDTO} from "../dtos/NavItemDTO";
import {SUI} from "../sui/SUI";

export class MenuPage {

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static navId = 'menu-page-nav';

  static navItemsId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueIndicatorContentId = 'menu-page-dialogue-indicator-content';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueScreenContentId = 'menu-page-dialogue-screen-content';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  /* Element IDs End */

  static router = new MenuPageRouter();

  static sui = new SUI();

  static dialogueBtnAHandler = () => {};

  static dialogueBtnBHandler = () => {};

  /**
   * @param {NavItemDTO[]}items
   * @param {string|null} activeId the ID of the active nav item
   */
  static setNavItems(items, activeId = null) {

    let itemsHtml = '';

    for (let i = 0; i < items.length; i++) {
      const activeClass= (activeId === items[i].id || (!activeId && i === 0)) ? 'sui-mod-active' : '';

      itemsHtml += `<a 
        id="${items[i].id}"
        class="sui-screen-nav-item ${activeClass}"
        href="javascript:void(0)"
      >${items[i].label}</a>`;
    }

    document.getElementById(MenuPage.navItemsId).innerHTML = itemsHtml;

    for (let i = 0; i < items.length; i++) {
      document.getElementById(items[i].id).addEventListener('click', items[i].actionHandler);
    }
  }

  static disableCloseBtn() {
    document.getElementById(MenuPage.closeBtnId).classList.add('hidden');
  }

  static enableCloseBtn() {
    document.getElementById(MenuPage.closeBtnId).classList.remove('hidden');
  }

  static hideAndClearNav() {
    const navItems = [
      new NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-structs');
    document.getElementById(MenuPage.navId).classList.add('hidden');
  }

  static showNav() {
    document.getElementById(MenuPage.navId).classList.remove('hidden');
  }

  static setBodyContent(content) {
    document.getElementById(MenuPage.bodyId).innerHTML = content;
  }

  static setDialogueIndicatorContent(content, useFadeAnimation = false) {
    const dialogueIndicatorContent = document.getElementById(MenuPage.dialogueIndicatorContentId);
    dialogueIndicatorContent.innerHTML = content;

    if (useFadeAnimation) {
      MenuPage.applyFadeInFadeOutAnimation(dialogueIndicatorContent);
    }
  }

  static applyFadeInFadeOutAnimation(element) {
    element.classList.add('fade-in-fade-out');
    element.addEventListener('animationend', () => {
      element.classList.remove('fade-in-fade-out');
    });
  }

  static setDialogueScreenContent(content, useFadeAnimation = false) {
    const dialogueScreenContent = document.getElementById(MenuPage.dialogueScreenContentId);
    dialogueScreenContent.innerHTML = content;

    if (useFadeAnimation) {
      MenuPage.applyFadeInFadeOutAnimation(dialogueScreenContent);
    }
  }

  static setBodyContentWithPageTemplate(content) {
    const pageTemplate = `
      <div class="sui-page-body-screen-content">
  
        <!-- Page Header Start -->
  
        <div class="sui-page-header">
          <a href="javascript: void(0)" class="sui-nav-btn">
            <i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>
            Member Roster
          </a>
  
          <div class="sui-page-header-resources">
            <a href="javascript: void(0)" class="sui-resource">
              <span>32/50</span>
              <i class="sui-icon sui-icon-energy"></i>
            </a>
            <a href="javascript: void(0)" class="sui-resource">
              <span>3</span>
              <i class="sui-icon sui-icon-alpha-matter"></i>
            </a>
          </div>
        </div>
  
        <!-- Page Header End -->
  
        <!-- Screen Body Start -->
  
        <div class="sui-screen-body">
  
        <!-- Content Start -->
        
        ${content}
  
        <!-- Content End -->
  
        </div>
      </div>
    `;
    MenuPage.setBodyContent(pageTemplate);
  }

  static setDialogueScreenTheme(theme) {
    const dialogueScreen = document.getElementById(MenuPage.dialogueScreenId);
    dialogueScreen.classList.remove(...dialogueScreen.classList);
    dialogueScreen.classList.add('sui-screen-dialogue');
    dialogueScreen.classList.add(theme);
  }

  static setDialogueScreenThemeToNeutral() {
    MenuPage.setDialogueScreenTheme('sui-theme-neutral');
  }

  static setDialogueScreenThemeToEnemy() {
    MenuPage.setDialogueScreenTheme('sui-theme-enemy');
  }

  static enableDialogueBtnA() {
    document.getElementById(MenuPage.dialogueBtnAId).classList.remove('hidden');
  }

  static disableDialogueBtnA() {
    document.getElementById(MenuPage.dialogueBtnAId).classList.add('hidden');
  }

  static enableDialogueBtnB() {
    document.getElementById(MenuPage.dialogueBtnChunkBId).classList.remove('hidden');
  }

  static disableDialogueBtnB() {
    document.getElementById(MenuPage.dialogueBtnChunkBId).classList.add('hidden');
  }

  static clearDialogueScreen() {
    document.getElementById(MenuPage.dialogueScreenContentId).innerHTML = '';
  }

  static clearDialogueBtnAHandler() {
    MenuPage.dialogueBtnAHandler = () => {};
  }

  static clearDialogueBtnBHandler() {
    MenuPage.dialogueBtnBHandler = () => {};
  }

  static hideAndClearDialoguePanel() {
    document.getElementById(MenuPage.dialoguePanelId).classList.add('hidden');
    MenuPage.clearDialogueScreen();
    MenuPage.setDialogueScreenThemeToNeutral();
    MenuPage.clearDialogueBtnAHandler();
    MenuPage.clearDialogueBtnBHandler();
  }

  static showDialoguePanel() {
    document.getElementById(MenuPage.dialoguePanelId).classList.remove('hidden');
  }

  static closeBtnHandler() {
    document.getElementById(MenuPage.pageLayoutId).classList.add('hidden');
  }

  static close() {
    MenuPage.closeBtnHandler();
  }

  static open() {
    document.getElementById(MenuPage.pageLayoutId).classList.remove('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPage.closeBtnId).addEventListener('click', MenuPage.closeBtnHandler);
  }

  static initDialogueBtnAListener() {
    const dialogueBtnA = document.getElementById(MenuPage.dialogueBtnAId);
    dialogueBtnA.addEventListener('click', () => {
      MenuPage.dialogueBtnAHandler();
    });
  }

  static initDialogueBtnBListener() {
    const dialogueBtnB = document.getElementById(MenuPage.dialogueBtnBId);
    dialogueBtnB.addEventListener('click', () => {
      MenuPage.dialogueBtnBHandler();
    });
  }

  static initListeners() {
    MenuPage.initCloseBtnListener();
    MenuPage.initDialogueBtnAListener();
    MenuPage.initDialogueBtnBListener();
  }
}
