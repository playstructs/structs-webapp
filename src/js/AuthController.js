import {MenuPage} from './MenuPage';
import {NavItemDTO} from "./NavItemDTO";
import {AbstractController} from "./AbstractController";
import {USERNAME_PATTERN} from "./RegexPattern";

export class AuthController extends AbstractController {
  constructor(gameState) {
    super('Auth', gameState);
  }

  index() {
    const navItems = [
      new NavItemDTO(
        'nav-item-structs',
        'Structs'
      )
    ];
    MenuPage.setNavItems(navItems, 'nav-item-structs');
    MenuPage.disableCloseBtn()
    MenuPage.setBodyContent(`
    <div class="sui-page-body-screen-content sui-screen-body justified-centered">
      <img class="glitch-logo" src="/img/sui/logo/logo-structs.gif" alt="Animated Structs logo with glitching">
      
      <a id="new-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-primary">New Player</a>
      <a id="returning-player-btn" href="javascript: void(0)" class="sui-screen-btn fixed-256 sui-mod-secondary">Returning Player</a>
    </div>
    `);
    MenuPage.hideAndClearDialoguePanel();
    document.getElementById('new-player-btn').addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'signupConnectingToCorporate');
    });
    document.getElementById('returning-player-btn').addEventListener('click', () => {
      console.log('Returning Player');
    });
  }

  signupConnectingToCorporate() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn()

    MenuPage.setBodyContent(`
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

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-info sui-text-primary"></i>`);
    MenuPage.setDialogueScreenContent(`Connecting to Corporate Database...`);
    MenuPage.disableDialogueBtnB();
    MenuPage.disableDialogueBtnA();
    MenuPage.showDialoguePanel();

    document.getElementById('glitch-logo-fade').addEventListener('animationstart', () => {
      MenuPage.router.goto('Auth', 'signupConnectionSuccessful');
    })
  }

  signupConnectionSuccessful() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);

    document.getElementById('snc-logo-wrapper').innerHTML = `
        <img 
          class="snc-logo"
          src="/img/logo-snc.gif"
          alt="SNC logo"
        >
        <h2 class="sui-text-header sui-text-disabled">WE KNOW BETTER.</h2>
      `;

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-success sui-text-primary"></i>`, true);
    MenuPage.setDialogueScreenContent(`Connection Successful.`, true);
    MenuPage.showDialoguePanel();

    setTimeout(() => {
      MenuPage.router.goto('Auth', 'signupIncomingCall1');
    }, 4000);
  }

  signupIncomingCall1() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'Incoming Call'
      )
    ];
    MenuPage.setNavItems(navItems);

    MenuPage.setBodyContent(`
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

    MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-alert sui-text-warning"></i>`, true);
    MenuPage.setDialogueScreenContent(`<strong>Alert:</strong> Priority Call`, true);
    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.router.goto('Auth', 'signupIncomingCall2');
    };
    MenuPage.enableDialogueBtnA();
    MenuPage.showDialoguePanel();

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
      new NavItemDTO(
        'nav-item-text-only',
        'Connecting...'
      )
    ];
    MenuPage.setNavItems(navItems);

    MenuPage.setBodyContent(`
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

    MenuPage.disableDialogueBtnA();

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
      MenuPage.router.goto('Auth', 'signupIncomingCall3');
    }, 800);
  }

  signupIncomingCall3() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="hrbot-talking-large" class="mod-opaque"></div>
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`, true);
    MenuPage.setDialogueScreenContent(`<strong>SN.CORP:</strong> Greetings, SN.CORPORATION employee. I am your designated Synthetic Resources Officer.`, true);

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

    MenuPage.dialogueBtnAHandler = () => {
      MenuPage.setDialogueScreenContent(`I have been tasked with assisting you as you complete your <span class="sui-text-secondary">Employee Orientation</span>`, true);
      MenuPage.dialogueBtnAHandler = () => {
        MenuPage.router.goto('Auth', 'signupSetUsername');
      };
    };
    MenuPage.enableDialogueBtnA();
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