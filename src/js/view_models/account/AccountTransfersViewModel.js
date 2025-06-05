import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";

export class AccountTransfersViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.sendAlphaBtnId = 'account-menu-send-alpha-btn';
    this.transactionHistoryBtnId = 'account-menu-transaction-history-btn';
  }

  initPageCode() {
    document.getElementById(this.sendAlphaBtnId).addEventListener('click', () => {
      console.log('Send Alpha');
      // MenuPage.router.goto('Account', 'sendAlpha');
    });
    document.getElementById(this.transactionHistoryBtnId).addEventListener('click', () => {
      // console.log('Transaction History');
      MenuPage.router.goto('Account', 'transactionHistory');
    });
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Account', true, () => {
      MenuPage.router.goto('Account', 'index');
    });

    MenuPage.setPageTemplateContent(`
      <div class="menu-index-layout">         
        <a id="${this.sendAlphaBtnId}" class="menu-index-btn" href="javascript: void(0)">
          <i class="sui-icon sui-icon-lg icon-send-alpha sui-text-primary"></i>
          <div class="menu-index-btn-labels-container">
            <div class=menu-index-btn-nav-label>
              <span class="sui-text-header">Send Alpha</span>
              <i class="sui-icon icon-chevron-right sui-text-primary"></i>
            </div>
            <div></div>
          </div>
        </a>
        
        <a id="${this.transactionHistoryBtnId}" class="menu-index-btn" href="javascript: void(0)">
          <i class="sui-icon sui-icon-lg icon-in-progress sui-text-primary"></i>
          <div class="menu-index-btn-labels-container">
            <div class=menu-index-btn-nav-label>
              <span class="sui-text-header">Transaction History</span>
              <i class="sui-icon icon-chevron-right sui-text-primary"></i>
            </div>
            <div></div>
          </div>
        </a>
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
