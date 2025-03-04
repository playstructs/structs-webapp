/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/AuthController.js":
/*!******************************!*\
  !*** ./js/AuthController.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthController: () => (/* binding */ AuthController)
/* harmony export */ });
/* harmony import */ var _MenuPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPage */ "./js/MenuPage.js");
/* harmony import */ var _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NavItemDTO */ "./js/NavItemDTO.js");



class AuthController {
  constructor() {
    this.name = 'Auth';
  }

  index() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems, 'nav-item-structs');
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableCloseBtn()
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.hideAndClearDialoguePanel();
    document.getElementById('new-player-btn').addEventListener('click', () => {
      console.log('New Player');
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signup');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  signup() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableCloseBtn()

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <div class="connecting-logo-swap-container">
        <img
          id="glitch-logo-fade"
          class="glitch-logo fade-out"
          src="/img/sui/logo/logo-structs.gif"
          alt="Animated Structs logo with glitching"
        >
        <div class="snc-logo-wrapper fade-in">
          <img 
            class="snc-logo"
            src="/img/logo-snc.gif"
            alt="SNC logo"
          >
          <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
        </div>
      </div>
    </div>
    `);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicator(`<i class="sui-icon-md icon-info sui-text-primary"></i>`);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnB();
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnA();
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.showDialoguePanel();


    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      const navItems = [
        new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
          'nav-item-text-only',
          'SN.Corporation'
        )
      ];
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicator(`<i class="sui-icon-md icon-success sui-text-primary"></i>`);
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Connection Successful.`, true);
    })
  }
}

/***/ }),

/***/ "./js/MenuPage.js":
/*!************************!*\
  !*** ./js/MenuPage.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPage: () => (/* binding */ MenuPage)
/* harmony export */ });
/* harmony import */ var _MenuPageRouter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPageRouter */ "./js/MenuPageRouter.js");


class MenuPage {

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static navId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueScreenContentId = 'menu-page-dialogue-screen-content';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  /* Element IDs End */

  static router = new _MenuPageRouter__WEBPACK_IMPORTED_MODULE_0__.MenuPageRouter();

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

    document.getElementById(MenuPage.navId).innerHTML = itemsHtml;

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

  static setBodyContent(content) {
    document.getElementById(MenuPage.bodyId).innerHTML = content;
  }

  static setDialogueIndicator(content) {
    document.getElementById(MenuPage.dialogueIndicatorId).innerHTML = content;
  }

  static setDialogueScreenContent(content, useFadeAnimation = false) {
    const dialogueScreen = document.getElementById(MenuPage.dialogueScreenContentId);
    dialogueScreen.innerHTML = content;

    if (useFadeAnimation) {
      dialogueScreen.classList.add('fade-in-fade-out');
      dialogueScreen.addEventListener('animationend', () => {
        dialogueScreen.classList.remove('fade-in-fade-out');
      });
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


/***/ }),

/***/ "./js/MenuPageRouter.js":
/*!******************************!*\
  !*** ./js/MenuPageRouter.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPageRouter: () => (/* binding */ MenuPageRouter)
/* harmony export */ });
class MenuPageRouter {
  constructor() {
    this.controllers = new Map();
  }

  registerController(controller) {
    this.controllers.set(controller.name, controller);
  }

  goto(controllerName, pageName, options = {}) {
    this.controllers.get(controllerName)[pageName](options);
  }
}

/***/ }),

/***/ "./js/NavItemDTO.js":
/*!**************************!*\
  !*** ./js/NavItemDTO.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NavItemDTO: () => (/* binding */ NavItemDTO)
/* harmony export */ });
class NavItemDTO {
  constructor(id, label, actionHandler = () => {}) {
    this.id = id;
    this.label = label;
    this.actionHandler = actionHandler;
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _MenuPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPage */ "./js/MenuPage.js");
/* harmony import */ var _AuthController__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AuthController */ "./js/AuthController.js");



const authController = new _AuthController__WEBPACK_IMPORTED_MODULE_1__.AuthController();

_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.registerController(authController);

_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'index');

})();

/******/ })()
;
//# sourceMappingURL=index.js.map