import {MenuPage} from '../framework/MenuPage';
import {NavItemDTO} from "../dtos/NavItemDTO";
import {AbstractController} from "../framework/AbstractController";
import {USERNAME_PATTERN} from "../constants/RegexPattern";
import {IndexView} from "../views/IndexView";
import {SignupConnectingToCorporate1View} from "../views/SignupConnectingToCorporate1View";
import {SignupConnectingToCorporate2View} from "../views/SignupConnectingToCorporate2View";
import {SignupIncomingCall1View} from "../views/SignupIncomingCall1View";
import {SignupIncomingCall2View} from "../views/SignupIncomingCall2View";
import {SignupIncomingCall3View} from "../views/SignupIncomingCall3View";

export class AuthController extends AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
  }

  index() {
    const view = new IndexView();
    view.render();
  }

  signupConnectingToCorporate1() {
    const view = new SignupConnectingToCorporate1View();
    view.render();
  }

  signupConnectingToCorporate2() {
    const view = new SignupConnectingToCorporate2View();
    view.render();
  }

  signupIncomingCall1() {
    const view = new SignupIncomingCall1View();
    view.render();
  }

  signupIncomingCall2() {
    const view = new SignupIncomingCall2View();
    view.render();
  }

  signupIncomingCall3() {
    const view = new SignupIncomingCall3View();
    view.render();
  }

  signupSetUsername() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);

    MenuPage.setBodyContent(`
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

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    MenuPage.setDialogueScreenContent(`To begin, please confirm your identity.`, true);
    MenuPage.clearDialogueBtnAHandler();
    MenuPage.clearDialogueBtnBHandler();
    MenuPage.disableDialogueBtnA();
    MenuPage.disableDialogueBtnB();
    MenuPage.showDialoguePanel();

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

      if (!USERNAME_PATTERN.test(usernameInput.value)) {
        MenuPage.setDialogueScreenContent(`Only <strong>letters</strong>, <strong>numbers</strong>, <strong>-</strong> and <strong>_</strong> are allowed. <strong>Length</strong> must be between <strong>3</strong> and <strong>20</strong> characters.`, true);
      } else {
        this.gameState.signupRequest.username = document.getElementById('username-input').value;

        setUsernameNameSection.classList.remove('set-username-input-mode');
        setUsernameNameSection.classList.add('set-username-display-mode');
        setUsernameNameSection.innerHTML = `
          <div class="set-username-chosen-name sui-text-primary"><h1>${this.gameState.signupRequest.username}</h1></div>
          <div class="set-username-profile-created">Profile Created</div>
        `;

        MenuPage.setDialogueScreenContent(`Welcome, ${this.gameState.signupRequest.username}.`, true);
        MenuPage.dialogueBtnAHandler = () => {
          console.log('Profile Created OK');
        };
        MenuPage.enableDialogueBtnA();
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