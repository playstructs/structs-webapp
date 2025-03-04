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
/* harmony import */ var _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPageLayout */ "./js/MenuPageLayout.js");


class AuthController {
  constructor() {
    this.name = 'Auth';
  }

  index() {
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableCloseBtn()
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.hideAndClearDialoguePanel();
    document.getElementById('new-player-btn').addEventListener('click', () => {
      console.log('New Player');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  connecting() {
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableCloseBtn()
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
    </div>
    `);
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.showDialoguePanel();
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setDialogueScreenContent(`Connecting to Corporate Database...`);
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableDialogueBtnB();
    _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableDialogueBtnA();
  }

}

/***/ }),

/***/ "./js/MenuPageLayout.js":
/*!******************************!*\
  !*** ./js/MenuPageLayout.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPageLayout: () => (/* binding */ MenuPageLayout)
/* harmony export */ });
class MenuPageLayout {

  /* Element IDs Start */

  static pageLayoutId = 'menu-page-layout';

  static navId = 'menu-page-nav-items';

  static closeBtnId = 'menu-page-nav-close';

  static bodyId = 'menu-page-body-content';

  static dialoguePanelId = 'menu-page-dialogue';

  static dialogueIndicatorId = 'menu-page-dialogue-indicator';

  static dialogueScreenId = 'menu-page-dialogue-screen';

  static dialogueBtnChunkBId = 'menu-page-dialogue-btn-chunk-b';

  static dialogueBtnAId = 'menu-page-dialogue-btn-a';

  static dialogueBtnBId = 'menu-page-dialogue-btn-b';

  /* Element IDs End */

  static dialogueBtnAHandler = () => {};

  static dialogueBtnBHandler = () => {};

  static disableCloseBtn() {
    document.getElementById(MenuPageLayout.closeBtnId).classList.add('hidden');
  }

  static enableCloseBtn() {
    document.getElementById(MenuPageLayout.closeBtnId).classList.remove('hidden');
  }

  static setBodyContent(content) {
    document.getElementById(MenuPageLayout.bodyId).innerHTML = content;
  }

  static setDialogueScreenContent(content) {
    document.getElementById(MenuPageLayout.dialogueScreenId).innerHTML = content;
  }

  static setDialogueScreenTheme(theme) {
    const dialogueScreen = document.getElementById(MenuPageLayout.dialogueScreenId);
    dialogueScreen.classList.remove(...dialogueScreen.classList);
    dialogueScreen.classList.add('sui-screen-dialogue');
    dialogueScreen.classList.add(theme);
  }

  static setDialogueScreenThemeToNeutral() {
    MenuPageLayout.setDialogueScreenTheme('sui-theme-neutral');
  }

  static setDialogueScreenThemeToEnemy() {
    MenuPageLayout.setDialogueScreenTheme('sui-theme-enemy');
  }

  static enableDialogueBtnA() {
    document.getElementById(MenuPageLayout.dialogueBtnAId).classList.remove('hidden');
  }

  static disableDialogueBtnA() {
    document.getElementById(MenuPageLayout.dialogueBtnAId).classList.add('hidden');
  }

  static enableDialogueBtnB() {
    document.getElementById(MenuPageLayout.dialogueBtnChunkBId).classList.remove('hidden');
  }

  static disableDialogueBtnB() {
    document.getElementById(MenuPageLayout.dialogueBtnChunkBId).classList.add('hidden');
  }

  static clearDialogueScreen() {
    document.getElementById(MenuPageLayout.dialogueScreenId).innerHTML = '';
  }

  static clearDialogueBtnAHandler() {
    MenuPageLayout.dialogueBtnAHandler = () => {};
  }

  static clearDialogueBtnBHandler() {
    MenuPageLayout.dialogueBtnBHandler = () => {};
  }

  static hideAndClearDialoguePanel() {
    document.getElementById(MenuPageLayout.dialoguePanelId).classList.add('hidden');
    MenuPageLayout.clearDialogueScreen();
    MenuPageLayout.setDialogueScreenThemeToNeutral();
    MenuPageLayout.clearDialogueBtnAHandler();
    MenuPageLayout.clearDialogueBtnBHandler();
  }

  static showDialoguePanel() {
    document.getElementById(MenuPageLayout.dialoguePanelId).classList.remove('hidden');
  }

  static closeBtnHandler() {
    document.getElementById(MenuPageLayout.pageLayoutId).classList.add('hidden');
  }

  static initCloseBtnListener() {
    document.getElementById(MenuPageLayout.closeBtnId).addEventListener('click', MenuPageLayout.closeBtnHandler);
  }

  static initDialogueBtnAListener() {
    const dialogueBtnA = document.getElementById(MenuPageLayout.dialogueBtnAId);
    dialogueBtnA.addEventListener('click', () => {
      MenuPageLayout.dialogueBtnAHandler();
    });
  }

  static initDialogueBtnBListener() {
    const dialogueBtnB = document.getElementById(MenuPageLayout.dialogueBtnBId);
    dialogueBtnB.addEventListener('click', () => {
      MenuPageLayout.dialogueBtnBHandler();
    });
  }

  static initListeners() {
    MenuPageLayout.initCloseBtnListener();
    MenuPageLayout.initDialogueBtnAListener();
    MenuPageLayout.initDialogueBtnBListener();
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
/* harmony import */ var _MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPageLayout */ "./js/MenuPageLayout.js");
/* harmony import */ var _MenuPageRouter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MenuPageRouter */ "./js/MenuPageRouter.js");
/* harmony import */ var _AuthController__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AuthController */ "./js/AuthController.js");




_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableCloseBtn();
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.enableCloseBtn();

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setBodyContent(`
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
`);

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setDialogueScreenThemeToEnemy();

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.initListeners();

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.dialogueBtnAHandler = () => { console.log('A Pressed'); };
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.dialogueBtnBHandler = () => { console.log('B Pressed'); };

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.hideAndClearDialoguePanel();
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.showDialoguePanel();

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.dialogueBtnAHandler = () => { console.log('A'); };
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.dialogueBtnBHandler = () => { console.log('B'); };

_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableDialogueBtnB();
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.enableDialogueBtnB();
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.disableDialogueBtnA();
_MenuPageLayout__WEBPACK_IMPORTED_MODULE_0__.MenuPageLayout.enableDialogueBtnA();

const menuPageRouter = new _MenuPageRouter__WEBPACK_IMPORTED_MODULE_1__.MenuPageRouter();
const authController = new _AuthController__WEBPACK_IMPORTED_MODULE_2__.AuthController();
menuPageRouter.registerController(authController);
menuPageRouter.goto('Auth', 'index');
})();

/******/ })()
;
//# sourceMappingURL=index.js.map