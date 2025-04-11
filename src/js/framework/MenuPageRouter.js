export class MenuPageRouter {
  constructor() {
    this.controllers = new Map();

    this.currentController = null;
    this.currentPage = null;
    this.currentOptions = {};

    this.lastController = null;
    this.lastPage = null;
    this.lastOptions = {};
  }

  registerController(controller) {
    this.controllers.set(controller.name, controller);
  }

  goto(controllerName, pageName, options = {}) {
    this.lastController = this.currentController;
    this.lastPage = this.currentPage;
    this.lastOptions = this.currentOptions;

    this.currentController = controllerName;
    this.currentPage = pageName;
    this.currentOptions = options;

    localStorage.setItem("lastMenuPage", JSON.stringify({
      controller: this.lastController,
      page: this.lastPage,
      options: this.lastOptions
    }))
    localStorage.setItem("currentMenuPage", JSON.stringify({
      controller: controllerName,
      page: pageName,
      options: options
    }));

    this.controllers.get(controllerName)[pageName](options);
  }

  back() {
    this.goto(this.lastController, this.lastPage, this.lastOptions);
  }

  restore() {
    const lastMenuPage = JSON.parse(localStorage.getItem("lastMenuPage"));
    const currentMenuPage = JSON.parse(localStorage.getItem("currentMenuPage"));

    if (!currentMenuPage || !lastMenuPage) {
      throw new Error("No stored menu page to restore from.");
    }

    this.currentPage = lastMenuPage.page;
    this.currentController = lastMenuPage.controller;
    this.currentOptions = lastMenuPage.options;

    this.goto(currentMenuPage.controller, currentMenuPage.page, currentMenuPage.options);
  }

}