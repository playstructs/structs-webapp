import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class IncomingCall2ViewModel extends AbstractViewModel {
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
      MenuPage.router.goto('Auth', 'signupIncomingCall3');
    }, 800);
  }

  render() {
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

    this.initLottieAnimations();

    this.initPageCode();
  }
}