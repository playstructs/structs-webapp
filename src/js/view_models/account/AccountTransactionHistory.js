import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {Pagination} from "../templates/partials/Pagination";
import {PAGINATION_LIMITS} from "../../constants/PaginationLimits";

export class AccountTransactionHistory extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {number} page
   */
  constructor(
    gameState,
    guildAPI,
    page
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.numberFormatter = new NumberFormatter();
    this.page = page;
    this.playerId = this.gameState.thisPlayerId;
    // this.playerId = '1-1';
    this.transactions = [];
  }

  initPageCode() {
    this.transactions.forEach((transaction) => {
      document.getElementById(`transaction-${transaction.id}`).addEventListener('click', () => {
        MenuPage.router.goto(
          'Account',
          'transaction',
          {
            txId: transaction.id,
            comingFromPage: this.page
          }
        );
      });
    })
  }

  /**
   * @param {Transaction} transaction
   * @return {string}
   */
  renderTransactionHTML(transaction) {

    const iconClass = transaction.action === 'sent' ? 'icon-outgoing' : 'icon-incoming';
    const amount = this.numberFormatter.format(transaction.amount);
    const btnId = `transaction-${transaction.id}`;

    return `
      <div class="sui-result-row">
        <div class="sui-result-row-left-section">
          <div class="sui-result-row-portrait-icon sui-text-secondary">
            <i class="sui-icon sui-icon-md ${iconClass}"></i>
          </div>
          <div class="sui-result-row-player-info">
            <div class="sui-text-label-block">
              Transaction #${transaction.id}
            </div>
            <span class="sui-badge sui-mod-default">Completed</span>
          </div>
        </div>
        <div class="sui-result-row-right-section">
          <div class="sui-result-row-resources">
            <div class="sui-resource">
              <span>${amount}</span>
              <i class="sui-icon sui-icon-alpha-matter"></i>
            </div>
          </div>
          <a 
            id="${btnId}"
            href="javascript:void(0)"
            class="sui-screen-btn sui-mod-secondary"
          >View</a>
        </div>
      </div>
    `;
  }

  render () {
    this.guildAPI.getTransactions(this.playerId, this.page).then((transactions) => {
      this.guildAPI.countTransactions(this.playerId).then(transactionCount => {

        this.transactions = transactions;

        let noTransactionsMessage = `<div>No confirmed alpha transactions yet.</div>`;
        let paginationHTML = '';

        const pagination = new Pagination(
          this.page,
          PAGINATION_LIMITS.DEFAULT,
          transactionCount,
          'transactions',
          'Account',
          'transactionHistory'
        );

        if (transactionCount) {
          noTransactionsMessage = '';
          paginationHTML = pagination.render();
        }

        MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

        MenuPage.setPageTemplateHeaderBtn('Transaction History', true, () => {
          MenuPage.router.goto('Account', 'transfers');
        });

        const transactionListHTML = transactions.reduce((html, transaction) => {
          return html + this.renderTransactionHTML(transaction)
        }, '');

        MenuPage.setPageTemplateContent(`
          <div class="common-result-table-layout">
          
            ${noTransactionsMessage}
            
            <div class="sui-result-rows sui-result-table">
            
              ${transactionListHTML}
    
            </div>
            
            ${paginationHTML}

          </div>
        `);

        MenuPage.hideAndClearDialoguePanel();

        this.initPageCode();
        pagination.init();
      });
    });
  }
}
