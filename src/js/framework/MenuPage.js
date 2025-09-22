import {MenuPageRouter} from "./MenuPageRouter";
import {NavItemDTO} from "../dtos/NavItemDTO";
import {SUI} from "../sui/SUI";
import {EnergyUsageComponent} from "../view_models/components/EnergyUsageComponent";
import {AlphaOwnedComponent} from "../view_models/components/AlphaOwnedComponent";

export class MenuPage {

  /** @type {GameState} */
  static gameState;

  /** @type {MapManager} */
  static mapManager;

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static panelChunkId = 'menu-page-panel-chunk';

  static navId = 'menu-page-nav';

  static navItemsId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static screenBodyId = 'menu-page-screen-body';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueIndicatorContentId = 'menu-page-dialogue-indicator-content';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueScreenContentId = 'menu-page-dialogue-screen-content';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  static pageTemplateNavBtnId = 'menu-page-template-nav-btn';

  static resourceEnergyUsageId = 'menu-page-resource-energy-usage';

  static resourceAlphaOwnedId = 'menu-page-resource-alpha-owned';

  static pageTemplateContentId = 'menu-page-template-content';

  static navItemFleetId = 'nav-item-fleet';

  static navItemGuildId = 'nav-item-guild';

  static navItemAccountId = 'nav-item-Account';

  /* Element IDs End */

  static router = new MenuPageRouter();

  static sui = new SUI();

  static menuNavItems = [
    new NavItemDTO(
      MenuPage.navItemFleetId,
      'FLEET',
      () => { MenuPage.router.goto('Fleet', 'index') }
    ),
    new NavItemDTO(
      MenuPage.navItemGuildId,
      'GUILD',
      () => { MenuPage.router.goto('Guild', 'index') }
    ),
    new NavItemDTO(
      MenuPage.navItemAccountId,
      'ACCOUNT',
      () => { MenuPage.router.goto('Account', 'index') }
    )
  ];

  /* Dynamic Handlers Start */

  static dialogueBtnAHandler = () => {};

  static dialogueBtnBHandler = () => {};

  static pageTemplateNavBtnHandler = () => {};

  /* Dynamic Handlers End */

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

  static clearPageTemplateNavBtnHandler() {
    MenuPage.pageTemplateNavBtnHandler = () => {};
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
    MenuPage.mapManager.showActiveMap();
    console.log(MenuPage.gameState.activeMapContainerId)
    MenuPage.closeBtnHandler();
  }

  static open() {
    document.getElementById(MenuPage.pageLayoutId).classList.remove('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPage.closeBtnId).addEventListener('click', MenuPage.close);
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

  static initPageTemplateNavBtnListener() {
    const pageTemplateNavBtn = document.getElementById(MenuPage.pageTemplateNavBtnId);
    pageTemplateNavBtn.addEventListener('click', () => {
      MenuPage.pageTemplateNavBtnHandler();
    });
  }

  static initListeners() {
    MenuPage.initCloseBtnListener();
    MenuPage.initDialogueBtnAListener();
    MenuPage.initDialogueBtnBListener();
  }

  static enablePageTemplate(
    activeNavItemId = null,
    showResources = true,
    useTransparentBackground = false,
    useCustomResources = false,
    customResourcesHTML = '',
    initCustomPageTemplateCode = () => {}
  ) {

    MenuPage.setNavItems(MenuPage.menuNavItems, activeNavItemId);
    MenuPage.enableCloseBtn();

    let headerResourcesHTML = useCustomResources ? customResourcesHTML : '';
    let energyUsageComponent;
    let alphaOwnedComponent;

    if (!useCustomResources && showResources) {

      energyUsageComponent = new EnergyUsageComponent(
        MenuPage.gameState,
        MenuPage.resourceEnergyUsageId
      );

      alphaOwnedComponent = new AlphaOwnedComponent(
        MenuPage.gameState,
        MenuPage.resourceAlphaOwnedId,
      );

      headerResourcesHTML = `
        <div class="sui-page-header-resources">
          ${energyUsageComponent.renderHTML()}
          ${alphaOwnedComponent.renderHTML()}
        </div>
      `;

    }

    const pageTemplate = `
      <div class="sui-page-body-screen-content">
  
        <!-- Page Header Start -->
  
        <div class="sui-page-header">
          <a id="${this.pageTemplateNavBtnId}" href="javascript: void(0)" class="sui-nav-btn">
            <i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>
            Member Roster
          </a>
  
          ${headerResourcesHTML}
        </div>
  
        <!-- Page Header End -->
  
        <div id="${this.pageTemplateContentId}" class="sui-screen-body">
  
          <!-- Content -->
  
        </div>
      </div>
    `;

    MenuPage.setBodyContent(pageTemplate);

    MenuPage.useOpaqueBackground();

    if (useTransparentBackground) {
      MenuPage.useTransparentBackground();
    }

    if (!useCustomResources && showResources) {
      energyUsageComponent.initPageCode();
      alphaOwnedComponent.initPageCode();
    }

    MenuPage.initPageTemplateNavBtnListener();

    initCustomPageTemplateCode();
  }

  static setPageTemplateHeaderBtn(label, showBackIcon = false, handler = () => {}) {
    const backIcon = showBackIcon ? '<i class="sui-icon-sm icon-chevron-left sui-text-secondary"></i>' : '';
    document.getElementById(this.pageTemplateNavBtnId).innerHTML = `${backIcon} ${label}`;
    this.pageTemplateNavBtnHandler = handler;
  }

  static setPageTemplateContent(content) {
    document.getElementById(this.pageTemplateContentId).innerHTML = content;
  }

  static useTransparentBackground() {
    document.getElementById(this.screenBodyId).classList.add('hidden-background');
    document.getElementById(this.panelChunkId).classList.add('hidden-background');
  }

  static useOpaqueBackground() {
    document.getElementById(this.screenBodyId).classList.remove('hidden-background');
    document.getElementById(this.panelChunkId).classList.remove('hidden-background');
  }
}
