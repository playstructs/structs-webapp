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
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupConnectingToCorporate');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  signupConnectingToCorporate() {
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
        <div id="snc-logo-wrapper" class="snc-logo-wrapper fade-in">
        </div>
      </div>
    </div>
    `);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-primary"></i>`);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnB();
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnA();
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.showDialoguePanel();

    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupConnectionSuccessful');
    })
  }

  signupConnectionSuccessful() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    document.getElementById('snc-logo-wrapper').innerHTML = `
        <img 
          class="snc-logo"
          src="/img/logo-snc.gif"
          alt="SNC logo"
        >
        <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
      `;

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-success sui-text-primary"></i>`, true);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Connection Successful.`, true);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.showDialoguePanel();

    setTimeout(() => {
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupIncomingCall1');
    }, 4000);
  }

  signupIncomingCall1() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'Incoming Call'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>
      <img
        id="hrbot-silhouette"
        class="hrbot-silhouette"
        src="/img/hrbot-silhouette.png"
        alt="A silhouette of the HR Bot"
      >
    </div>
    `);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-alert sui-text-warning"></i>`, true);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`<strong>Alert:</strong> Priority Call`, true);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.dialogueBtnAHandler = () => {
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupIncomingCall2');
    };
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.enableDialogueBtnA();
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.showDialoguePanel();

    const {lottie} = window;
    const {loadAnimation} = lottie;
    loadAnimation({
      container: document.getElementById('lottie-scan-lines'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/lottie/transition-scan-lines/data.json'
    });
  }

  signupIncomingCall2() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="hrbot-talking-large" class="fade-in"></div>
      <img
        id="hrbot-silhouette"
        class="hrbot-silhouette"
        src="/img/hrbot-silhouette.png"
        alt="A silhouette of the HR Bot"
      >
    </div>
    `);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnA();

    const {lottie} = window;
    const {loadAnimation} = lottie;
    loadAnimation({
      container: document.getElementById('hrbot-talking-large'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/lottie/hr-bot/data.json'
    });

    setTimeout(() => {
      _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupIncomingCall3');
    }, 800);
  }

  signupIncomingCall3() {
    const navItems = [
      new _NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="hrbot-talking-large" class="mod-opaque"></div>
    </div>
    `);

    // TODO: Setup indicator profile lottie animation

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`, true);
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`<strong>SN.CORP:</strong> Greetings, SN.CORPORATION employee. I am your designated Synthetic Resources Officer.`, true);

    const {lottie} = window;
    const {loadAnimation} = lottie;
    const lottieHRBotLarge = loadAnimation({
      container: document.getElementById('hrbot-talking-large'),
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: '/lottie/hr-bot/data.json'
    });
    const lottieHRBotSmall = loadAnimation({
      container: document.getElementById('hrbot-talking-small'),
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: '/lottie/hr-bot/data.json'
    });
    setTimeout(() => {
      lottieHRBotLarge.play();
      lottieHRBotSmall.play();
    })

    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.dialogueBtnAHandler = () => {
      console.log('A');
    };
    _MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.enableDialogueBtnA();
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

  static dialogueIndicatorContentId = 'menu-page-dialogue-indicator-content';

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
_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.initListeners();

_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'index');

// MenuPage.router.goto('Auth', 'signupCallIntro1');

})();

/******/ })()
;
//# sourceMappingURL=index.js.map