import {NavItemDTO} from "../../dtos/NavItemDTO";
import {MenuPage} from "../../framework/MenuPage";

export class OrientationStructDeployedTemplate {

  constructor() {
    this.sequenceIndex = 0;

    this.dialogueSequence = []; // Dialogue always changes in the sequence index changes.

    // Objects allow you to specify which indexes the body text and page code should change.
    this.bodyTextSequence = {};
    this.pageCodeSequence = {};

    this.actionOnSequenceEnd = () => {};
  }

  initLottieAnimations() {
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
  }

  initPageCode() {
    if (this.pageCodeSequence[0]) {
      this.pageCodeSequence[0]();
    }
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
    MenuPage.showNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">

      <div id="lottie-scan-lines-wrapper" class="lottie-scan-lines-wrapper">
        <div id="lottie-scan-lines"></div>
      </div>
      
      <div class="generic-land-background">
        <div class="common-layout-col">
          <div class="orientation-icon-text-layout">
            <img
              id="orientation-struct-deployment"
              src="/img/orientation-struct-deployment.gif"
              alt="Deployment pod dropped from space, opening and reveal a Struct"
            >
            <div class="orientation-display-text-group" style="min-width: 294px">
              <div class="orientation-display-text-header mod-dark-bg">
                <span class="sui-text-display">STRUCTS</span>
              </div>
              <div class="orientation-display-text-body mod-dark-bg">
                <span id="orientation-struct-deployment-body-text" class="sui-text-hint">Galactic Codex Entry #2722</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.setDialogueIndicatorContent(`<div id="hrbot-talking-small"></div>`);
    MenuPage.setDialogueScreenContent(
      `For this reason, Alpha mining operations are now conducted by a race of advanced machines knowns as
      <a 
        id="dialogueStructsHint" 
        class="sui-mod-secondary"
        href="javascript: void(0)" 
        data-sui-tooltip="A civilization of  machines, discovered approximately 1200 years ago."
      >Structs.</a>`
    );
    MenuPage.dialogueBtnAHandler = () => {
      this.sequenceIndex++;

      if (this.sequenceIndex < this.dialogueSequence.length) {
        const bodyTextElm = document.getElementById('orientation-struct-deployment-body-text');
        bodyTextElm.innerHTML = this.bodyTextSequence[this.sequenceIndex];

        MenuPage.setDialogueScreenContent(this.dialogueSequence[this.sequenceIndex], true);

        if (this.pageCodeSequence[this.sequenceIndex]) {
          this.pageCodeSequence[this.sequenceIndex]();
        }
      }

      if (this.sequenceIndex === this.dialogueSequence.length) {
        this.actionOnSequenceEnd();
      }
    };
    MenuPage.disableDialogueBtnB();
    MenuPage.enableDialogueBtnA();
    MenuPage.showDialoguePanel();

    this.initLottieAnimations();
    this.initPageCode();
  }
}