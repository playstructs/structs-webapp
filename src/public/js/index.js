/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/constants/RegexPattern.js":
/*!**************************************!*\
  !*** ./js/constants/RegexPattern.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   USERNAME_PATTERN: () => (/* binding */ USERNAME_PATTERN)
/* harmony export */ });
const
  USERNAME_PATTERN = /^[\p{L}0-9-_]{3,20}$/u
;

/***/ }),

/***/ "./js/controllers/AuthController.js":
/*!******************************************!*\
  !*** ./js/controllers/AuthController.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthController: () => (/* binding */ AuthController)
/* harmony export */ });
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_AbstractController__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/AbstractController */ "./js/framework/AbstractController.js");
/* harmony import */ var _constants_RegexPattern__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/RegexPattern */ "./js/constants/RegexPattern.js");
/* harmony import */ var _views_IndexView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../views/IndexView */ "./js/views/IndexView.js");
/* harmony import */ var _views_SignupConnectingToCorporate1View__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../views/SignupConnectingToCorporate1View */ "./js/views/SignupConnectingToCorporate1View.js");
/* harmony import */ var _views_SignupConnectingToCorporate2View__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../views/SignupConnectingToCorporate2View */ "./js/views/SignupConnectingToCorporate2View.js");
/* harmony import */ var _views_SignupIncomingCall1View__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../views/SignupIncomingCall1View */ "./js/views/SignupIncomingCall1View.js");
/* harmony import */ var _views_SignupIncomingCall2View__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../views/SignupIncomingCall2View */ "./js/views/SignupIncomingCall2View.js");










class AuthController extends _framework_AbstractController__WEBPACK_IMPORTED_MODULE_2__.AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
  }

  index() {
    const view = new _views_IndexView__WEBPACK_IMPORTED_MODULE_4__.IndexView();
    view.render();
  }

  signupConnectingToCorporate1() {
    const view = new _views_SignupConnectingToCorporate1View__WEBPACK_IMPORTED_MODULE_5__.SignupConnectingToCorporate1View();
    view.render();
  }

  signupConnectingToCorporate2() {
    const view = new _views_SignupConnectingToCorporate2View__WEBPACK_IMPORTED_MODULE_6__.SignupConnectingToCorporate2View();
    view.render();
  }

  signupIncomingCall1() {
    const view = new _views_SignupIncomingCall1View__WEBPACK_IMPORTED_MODULE_7__.SignupIncomingCall1View();
    view.render();
  }

  signupIncomingCall2() {
    const view = new _views_SignupIncomingCall2View__WEBPACK_IMPORTED_MODULE_8__.SignupIncomingCall2View();
    view.render();
  }

  signupIncomingCall3() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="hrbot-talking-large" class="mod-opaque"></div>
    </div>
    `);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`<strong>SN.CORP:</strong> Greetings, SN.CORPORATION employee. I am your designated Synthetic Resources Officer.`, true);

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

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.dialogueBtnAHandler = () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`I have been tasked with assisting you as you complete your <span class="sui-text-secondary">Employee Orientation</span>`, true);
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.dialogueBtnAHandler = () => {
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'signupSetUsername');
      };
    };
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.enableDialogueBtnA();
  }

  signupSetUsername() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_1__.NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setNavItems(navItems);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="lottie-scan-lines-wrapper" class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>
      <div class="sui-page-body-screen-content mod-positioned-absolute">
        <div class="set-username-screen-body">
          <div class="set-username-wrapper">
            <div class="set-username-pfp-section">
              <div class="set-username-pfp">
              </div>
            </div>
            <div id="set-username-name-section" class="set-username-input-mode">
              <div class="set-username-field-wrapper">
                <label class="sui-input-text" for="username">
                <span>Display Name</span>
                <input
                  type="text"
                  name="username"
                  id="username-input"
                  placeholder="Your Name"
                >
              </label>
              </div>
              <div class="set-username-btn-wrapper">
                <a id="submit-btn" href="javascript: void(0)" class="sui-screen-btn sui-mod-disabled">Submit</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`To begin, please confirm your identity.`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.clearDialogueBtnAHandler();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.clearDialogueBtnBHandler();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnA();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.disableDialogueBtnB();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.showDialoguePanel();

    const {lottie} = window;
    const {loadAnimation} = lottie;
    const scanLines = loadAnimation({
      container: document.getElementById('lottie-scan-lines'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/lottie/transition-scan-lines/data.json'
    });
    loadAnimation({
      container: document.getElementById('hrbot-talking-small'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lottie/hr-bot/data.json'
    });

    scanLines.addEventListener('complete', () => {
      document.getElementById('lottie-scan-lines').classList.add('hidden');
    });

    const usernameInput = document.getElementById('username-input');
    usernameInput.addEventListener('keyup', () => {
      const submitBtn = document.getElementById('submit-btn');

      if (usernameInput.value.length > 0 && submitBtn.classList.contains('sui-mod-disabled')) {
        submitBtn.classList.remove('sui-mod-disabled');
        submitBtn.classList.add('sui-mod-primary');
      } else if (usernameInput.value.length === 0 && submitBtn.classList.contains('sui-mod-primary')) {
        submitBtn.classList.remove('sui-mod-primary');
        submitBtn.classList.add('sui-mod-disabled');
      }
    });

    const setUsernameNameSection = document.getElementById('set-username-name-section');

    const submitBtnHandler = () => {
      const usernameInput = document.getElementById('username-input');

      if (!_constants_RegexPattern__WEBPACK_IMPORTED_MODULE_3__.USERNAME_PATTERN.test(usernameInput.value)) {
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Only <strong>letters</strong>, <strong>numbers</strong>, <strong>-</strong> and <strong>_</strong> are allowed. <strong>Length</strong> must be between <strong>3</strong> and <strong>20</strong> characters.`, true);
      } else {
        this.gameState.signupRequest.username = document.getElementById('username-input').value;

        setUsernameNameSection.classList.remove('set-username-input-mode');
        setUsernameNameSection.classList.add('set-username-display-mode');
        setUsernameNameSection.innerHTML = `
          <div class="set-username-chosen-name sui-text-primary"><h1>${this.gameState.signupRequest.username}</h1></div>
          <div class="set-username-profile-created">Profile Created</div>
        `;

        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.setDialogueScreenContent(`Welcome, ${this.gameState.signupRequest.username}.`, true);
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.dialogueBtnAHandler = () => {
          console.log('Profile Created OK');
        };
        _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.enableDialogueBtnA();
      }
    };

    document.getElementById('submit-btn').addEventListener('click', submitBtnHandler);
    usernameInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        submitBtnHandler();
      }
    });
  }
}

/***/ }),

/***/ "./js/dtos/NavItemDTO.js":
/*!*******************************!*\
  !*** ./js/dtos/NavItemDTO.js ***!
  \*******************************/
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

/***/ }),

/***/ "./js/dtos/SignupRequestDTO.js":
/*!*************************************!*\
  !*** ./js/dtos/SignupRequestDTO.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignupRequestDTO: () => (/* binding */ SignupRequestDTO)
/* harmony export */ });
class SignupRequestDTO {
  constructor() {
      this.primary_address = null;
      this.signature = null;
      this.pubkey = null;
      this.guild_id = null;
      this.username = null;
      this.pfp = null;
  }
}

/***/ }),

/***/ "./js/framework/AbstractController.js":
/*!********************************************!*\
  !*** ./js/framework/AbstractController.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractController: () => (/* binding */ AbstractController)
/* harmony export */ });
class AbstractController {
  /**
   * @param {string} name
   * @param {GameState} gameState
   */
  constructor(name, gameState) {
    this.name = name;
    this.gameState = gameState;
  }
}

/***/ }),

/***/ "./js/framework/AbstractView.js":
/*!**************************************!*\
  !*** ./js/framework/AbstractView.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractView: () => (/* binding */ AbstractView)
/* harmony export */ });
/* harmony import */ var _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotImplementedError */ "./js/framework/NotImplementedError.js");


class AbstractView {
  render() {
    throw new _NotImplementedError__WEBPACK_IMPORTED_MODULE_0__.NotImplementedError();
  }
}


/***/ }),

/***/ "./js/framework/MenuPage.js":
/*!**********************************!*\
  !*** ./js/framework/MenuPage.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuPage: () => (/* binding */ MenuPage)
/* harmony export */ });
/* harmony import */ var _MenuPageRouter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MenuPageRouter */ "./js/framework/MenuPageRouter.js");


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

/***/ "./js/framework/MenuPageRouter.js":
/*!****************************************!*\
  !*** ./js/framework/MenuPageRouter.js ***!
  \****************************************/
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

/***/ "./js/framework/NotImplementedError.js":
/*!*********************************************!*\
  !*** ./js/framework/NotImplementedError.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotImplementedError: () => (/* binding */ NotImplementedError)
/* harmony export */ });
class NotImplementedError extends Error {
  constructor(message= 'Function not implemented') {
    super(message);
    this.name = "NotImplementedError";
  }
}


/***/ }),

/***/ "./js/models/GameState.js":
/*!********************************!*\
  !*** ./js/models/GameState.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameState: () => (/* binding */ GameState)
/* harmony export */ });
/* harmony import */ var _dtos_SignupRequestDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/SignupRequestDTO */ "./js/dtos/SignupRequestDTO.js");


class GameState {

  constructor() {
    this.signupRequest = new _dtos_SignupRequestDTO__WEBPACK_IMPORTED_MODULE_0__.SignupRequestDTO();
  }
}

/***/ }),

/***/ "./js/views/IndexView.js":
/*!*******************************!*\
  !*** ./js/views/IndexView.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IndexView: () => (/* binding */ IndexView)
/* harmony export */ });
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/AbstractView */ "./js/framework/AbstractView.js");




class IndexView extends _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {

  initPageCode() {
    document.getElementById('new-player-btn').addEventListener('click', () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.router.goto('Auth', 'signupConnectingToCorporate1');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  render () {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__.NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setNavItems(navItems, 'nav-item-structs');
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableCloseBtn()

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}


/***/ }),

/***/ "./js/views/SignupConnectingToCorporate1View.js":
/*!******************************************************!*\
  !*** ./js/views/SignupConnectingToCorporate1View.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignupConnectingToCorporate1View: () => (/* binding */ SignupConnectingToCorporate1View)
/* harmony export */ });
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/AbstractView */ "./js/framework/AbstractView.js");




class SignupConnectingToCorporate1View extends _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {

  initPageCode() {
    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.router.goto('Auth', 'signupConnectingToCorporate2');
    });
  }

  render() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__.NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setNavItems(navItems);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableCloseBtn()

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setBodyContent(`
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

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-primary"></i>`);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableDialogueBtnB();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableDialogueBtnA();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.showDialoguePanel();

    this.initPageCode();
  }
}


/***/ }),

/***/ "./js/views/SignupConnectingToCorporate2View.js":
/*!******************************************************!*\
  !*** ./js/views/SignupConnectingToCorporate2View.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignupConnectingToCorporate2View: () => (/* binding */ SignupConnectingToCorporate2View)
/* harmony export */ });
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/AbstractView */ "./js/framework/AbstractView.js");




class SignupConnectingToCorporate2View extends _framework_AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {

  initPageCode() {
    setTimeout(() => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.router.goto('Auth', 'signupIncomingCall1');
    }, 4000);
  }

  render() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__.NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setNavItems(navItems);

    document.getElementById('snc-logo-wrapper').innerHTML = `
        <img 
          class="snc-logo"
          src="/img/logo-snc.gif"
          alt="SNC logo"
        >
        <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
      `;

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-success sui-text-primary"></i>`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueScreenContent(`Connection Successful.`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.showDialoguePanel();

    this.initPageCode();
  }
}


/***/ }),

/***/ "./js/views/SignupIncomingCall1View.js":
/*!*********************************************!*\
  !*** ./js/views/SignupIncomingCall1View.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignupIncomingCall1View: () => (/* binding */ SignupIncomingCall1View)
/* harmony export */ });
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");



class SignupIncomingCall1View {

  initLottieAnimations() {
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

  render() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__.NavItemDTO(
        'nav-item-text-only',
        'Incoming Call'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setNavItems(navItems);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableCloseBtn();

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setBodyContent(`
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

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-alert sui-text-warning"></i>`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setDialogueScreenContent(`<strong>Alert:</strong> Priority Call`, true);
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.dialogueBtnAHandler = () => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.router.goto('Auth', 'signupIncomingCall2');
    };
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.enableDialogueBtnA();
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.showDialoguePanel();

    this.initLottieAnimations();
  }
}

/***/ }),

/***/ "./js/views/SignupIncomingCall2View.js":
/*!*********************************************!*\
  !*** ./js/views/SignupIncomingCall2View.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SignupIncomingCall2View: () => (/* binding */ SignupIncomingCall2View)
/* harmony export */ });
/* harmony import */ var _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dtos/NavItemDTO */ "./js/dtos/NavItemDTO.js");
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../framework/MenuPage */ "./js/framework/MenuPage.js");



class SignupIncomingCall2View {
  initLottieAnimations() {
    const {lottie} = window;
    const {loadAnimation} = lottie;
    loadAnimation({
      container: document.getElementById('hrbot-talking-large'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/lottie/hr-bot/data.json'
    });
  }

  initPageCode() {
    setTimeout(() => {
      _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.router.goto('Auth', 'signupIncomingCall3');
    }, 800);
  }

  render() {
    const navItems = [
      new _dtos_NavItemDTO__WEBPACK_IMPORTED_MODULE_0__.NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setNavItems(navItems);

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.setBodyContent(`
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

    _framework_MenuPage__WEBPACK_IMPORTED_MODULE_1__.MenuPage.disableDialogueBtnA();

    this.initLottieAnimations();

    this.initPageCode();
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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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
/* harmony import */ var _framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./framework/MenuPage */ "./js/framework/MenuPage.js");
/* harmony import */ var _controllers_AuthController__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controllers/AuthController */ "./js/controllers/AuthController.js");
/* harmony import */ var _models_GameState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./models/GameState */ "./js/models/GameState.js");




const gameState = new _models_GameState__WEBPACK_IMPORTED_MODULE_2__.GameState();
__webpack_require__.g.gameState = gameState;

const authController = new _controllers_AuthController__WEBPACK_IMPORTED_MODULE_1__.AuthController(gameState);

_framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.registerController(authController);
_framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.initListeners();

_framework_MenuPage__WEBPACK_IMPORTED_MODULE_0__.MenuPage.router.goto('Auth', 'index');

// MenuPage.router.goto('Auth', 'signupSetUsername');

})();

/******/ })()
;
//# sourceMappingURL=index.js.map