import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class HRBotTalkingTemplate {

  constructor() {
    this.dialogueSequence = [];
    this.dialogueIndex = 0;
    this.actionOnSequenceEnd = () => {};
    this.startWithScanLines = false;
  }

  initLottieAnimations() {
    const {lottie} = window;
    const {loadAnimation} = lottie;

    if (this.startWithScanLines) {

      const scanLines = loadAnimation({
        container: document.getElementById('lottie-scan-lines'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/lottie/transition-scan-lines/data.json'
      });
      scanLines.addEventListener('complete', () => {
        document.getElementById('lottie-scan-lines').classList.add('hidden');
      });

    }

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
    }, 500);
  }

  render() {
    const navItems = [
      new NavItemDTO(
        'nav-item-text-only',
        'SN.Corporation'
      )
    ];
    MenuPage.setNavItems(navItems);
    MenuPage.disableCloseBtn();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
      <div id="lottie-scan-lines-wrapper" class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>
      <div id="hrbot-talking-large" class="mod-opaque"></div>
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`, true);
    MenuPage.setDialogueScreenContent(this.dialogueSequence[0], true);

    MenuPage.disableDialogueBtnB();
    MenuPage.clearDialogueBtnBHandler();
    MenuPage.dialogueBtnAHandler = () => {
      this.dialogueIndex++;

      if (this.dialogueIndex < this.dialogueSequence.length) {
        MenuPage.setDialogueScreenContent(this.dialogueSequence[this.dialogueIndex], true);
      }

      if (this.dialogueIndex === this.dialogueSequence.length) {
        this.actionOnSequenceEnd();
      }
    };
    MenuPage.enableDialogueBtnA();
    MenuPage.showDialoguePanel();

    this.initLottieAnimations();
  }
}