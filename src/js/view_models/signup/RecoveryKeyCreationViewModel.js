import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PageHeader} from "../templates/partials/PageHeader";

export class RecoveryKeyCreationViewModel extends AbstractViewModel {

  /**
   * @param mnemonic
   */
  constructor(mnemonic) {
    super();
    this.mnemonic = mnemonic;
  }

  /**
   * @param {string} mnemonic
   * @return {string} html
   */
  renderRecoveryKeyHtml(mnemonic) {
    const mnemonicArray = mnemonic.split(' ');

    let html = `<div id="recovery-key" class="text-recovery-key hidden">`;

    for (let i = 0; i < mnemonicArray.length; i++) {
      html += `
      <div class="recovery-key-word">
        <span class="sui-text-secondary">${i + 1}</span>
        <span class="mod-white">${mnemonicArray[i]}</span>
      </div>
      `;
    }

    html += `</div>`;

    return html;
  }

  initPageCode() {
    document.getElementById('display-recovery-key-btn').addEventListener('click', () => {
      document.getElementById('display-recovery-key-btn').classList.add('hidden');
      document.getElementById('recovery-key').classList.remove('hidden');

      const writtenDownBtn = document.getElementById('written-down-btn');
      writtenDownBtn.classList.remove('sui-mod-disabled');
      writtenDownBtn.classList.add('sui-mod-primary');
      writtenDownBtn.disabled = false;
    });

    document.getElementById('written-down-btn').addEventListener('click', () => {
      MenuPage.router.goto('Auth', 'signupRecoveryKeyConfirmation');
    });
  }

  async render() {
    const recoveryKeyHtml = this.renderRecoveryKeyHtml(this.mnemonic);

    const pageHeader = new PageHeader();
    pageHeader.pageLabel = 'Create Recovery Key';

    MenuPage.hideAndClearNav();

    MenuPage.setBodyContent(`
    <div class="full-screen-content-container">
    
      ${pageHeader.render()}
        
      <div class="common-layout-col">
        <div class="common-group-col">
          <div>Write down your 12-word Recovery Key and keep it in a safe place. You will need this Key to recover your account if you log out or clear your browser cache.</div>
          <a href="javascript: void(0);" class="sui-text-secondary">Learn More About Recovery Keys</a>
        </div>
        <div class="common-group-col mod-border">
          <a id="display-recovery-key-btn" href="javascript: void(0);" class="sui-screen-btn sui-mod-secondary">
            <i class="sui-icon-md icon-key"></i>
            <span>Display Recovery Key</span>
          </a>
          ${ recoveryKeyHtml }
        </div>
        <div>
          <button id= "written-down-btn" class="sui-screen-btn sui-mod-disabled" disabled>I've Written It Down</button>
        </div>
      </div>
        
    </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}