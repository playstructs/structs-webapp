import {MENU_PAGE_ROUTER_MODES} from "../constants/MenuPageRouterModes";
import {parseWithBigInt, stringifyWithBigInt} from "../util/BigIntJson";

export class MenuPageRouter {
  constructor() {
    this.controllers = new Map();

    this.currentController = null;
    this.currentPage = null;
    this.currentOptions = {};

    this.lastController = null;
    this.lastPage = null;
    this.lastOptions = {};

    this.mode = MENU_PAGE_ROUTER_MODES.DEFAULT;

    /**
     * Incremented on every navigation. Async work started during one navigation
     * can compare a snapshot of this value against the current one to detect
     * whether the user has since navigated away.
     */
    this.navigationId = 0;

    /**
     * Pages that depend on in-flight async work or function-valued options
     * (which JSON serialization drops), so they cannot be restored after a reload.
     */
    this.nonRestorablePages = new Set([
      'Generic.menuWaiting'
    ]);
  }

  /**
   * @param {{controller: string, page: string}|null} menuPage
   * @return {boolean}
   */
  isRestorable(menuPage) {
    return !!menuPage
      && !this.nonRestorablePages.has(`${menuPage.controller}.${menuPage.page}`);
  }

  registerController(controller) {
    this.controllers.set(controller.name, controller);
  }

  goto(controllerName, pageName, options = {}) {
    this.navigationId++;

    if (this.mode !== MENU_PAGE_ROUTER_MODES.PREVIEW) {
      if (!(
        this.currentController === controllerName
        && this.currentPage === pageName
        && stringifyWithBigInt(this.currentOptions) === stringifyWithBigInt(options)
      )) {
        this.lastController = this.currentController;
        this.lastPage = this.currentPage;
        this.lastOptions = this.currentOptions;

        this.currentController = controllerName;
        this.currentPage = pageName;
        this.currentOptions = options;
      }

      localStorage.setItem("lastMenuPage", stringifyWithBigInt({
        controller: this.lastController,
        page: this.lastPage,
        options: this.lastOptions
      }))
      localStorage.setItem("currentMenuPage", stringifyWithBigInt({
        controller: controllerName,
        page: pageName,
        options: options
      }));
    }

    this.controllers.get(controllerName)[pageName](options);
  }

  back() {
    this.goto(this.lastController, this.lastPage, this.lastOptions);
  }

  restore(defaultController, defaultPage, defaultOptions = {}) {
    const lastMenuPage = parseWithBigInt(localStorage.getItem("lastMenuPage"));
    const currentMenuPage = parseWithBigInt(localStorage.getItem("currentMenuPage"));

    if (!currentMenuPage || !lastMenuPage || !this.isRestorable(currentMenuPage)) {
      this.goto(defaultController, defaultPage, defaultOptions);
    } else {
      if (this.isRestorable(lastMenuPage)) {
        this.currentPage = lastMenuPage.page;
        this.currentController = lastMenuPage.controller;
        this.currentOptions = lastMenuPage.options;
      }

      this.goto(currentMenuPage.controller, currentMenuPage.page, currentMenuPage.options);
    }
  }

  enablePreviewMode() {
    this.mode = MENU_PAGE_ROUTER_MODES.PREVIEW;
  }

  enableDefaultMode() {
    this.mode = MENU_PAGE_ROUTER_MODES.DEFAULT;
  }

}