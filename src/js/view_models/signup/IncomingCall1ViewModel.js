import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class IncomingCall1ViewModel {

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
      new NavItemDTO(
        'nav-item-text-only',
        'Incoming Call'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn();

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

    this.initLottieAnimations();
  }
}