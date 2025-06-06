import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {DateFormatter} from "../../util/DateFormatter";
import {GenericResourceComponent} from "../components/GenericResourceComponent";

export class AccountTransactionViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {number} txId
   * @param {number} comingFromPage
   */
  constructor(
    gameState,
    guildAPI,
    txId,
    comingFromPage
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.numberFormatter = new NumberFormatter();
    this.dateFormatter = new DateFormatter();
    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.txId = txId;
    this.comingFromPage = comingFromPage;
    this.amountId = 'transaction-resource-amount';
    this.counterpartyLinkId = 'transaction-counterparty-link';
    this.transaction = null;
    this.genericResourcePageCode = [
      this.genericResourceComponent.getPageCode(this.amountId)
    ];
  }

  initPageCode() {
    if (this.transaction.counterparty_player_id) {
      document.getElementById(this.counterpartyLinkId).addEventListener('click',  () => {
        console.log(this.transaction.counterparty_player_id);
      });
    }
  }

  /**
   * @return {string}
   */
  renderCounterpartyName() {
    if (this.transaction.counterparty_username) {
      return `<a id="${this.counterpartyLinkId}" class="sui-text-secondary" href="javascript:void(0)">${this.transaction.counterparty_username}</a>`;
    } else if (this.transaction.counterparty_player_id) {
      return `<a id="${this.counterpartyLinkId}" class="sui-text-secondary" href="javascript:void(0)">Player #${this.transaction.counterparty_player_id}</a>`;
    }
    return `${this.transaction.counterparty}`;
  }

  render () {
    this.guildAPI.getTransaction(this.txId).then((transaction) => {

      this.transaction = transaction;

      const counterpartyLabel = transaction.action === 'sent' ? 'Recipient' : 'Sender';

      MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

      MenuPage.setPageTemplateHeaderBtn('Transaction Details', true, () => {
        MenuPage.router.goto(
          'Account',
          'transactionHistory',
          {page: this.comingFromPage}
        );
      });

      MenuPage.setPageTemplateContent(`
        <div class="transaction-details-layout">
          <div>
            <i class="sui-icon sui-icon-md icon-success sui-text-primary"></i>
            This transaction was completed successfully.
          </div>
          
          <div class="sui-data-card">
            <div class="sui-data-card-header sui-text-header">Player Details</div>
            <div class="sui-data-card-body">
            
              <div class="sui-data-card-row">
                <div>Transaction ID</div>
                <div>${this.txId}</div>
              </div>
              
              <div class="sui-data-card-row">
                <div>Date</div>
                <div>${this.dateFormatter.formatDatetime(transaction.time)}</div>
              </div>
              
              <div class="sui-data-card-row">
                <div>Amount</div>
                <div>
                  ${
                    this.genericResourceComponent.renderHTML(
                      this.amountId,
                      'sui-icon-alpha-matter',
                      'Alpha Matter',
                      this.numberFormatter.format(transaction.amount)
                    )
                  }
                </div>
              </div>
              
              <div class="sui-data-card-row">
                <div>${counterpartyLabel}</div>
                <div>${this.renderCounterpartyName()}</div>
              </div>
            </div>
          </div>

        </div>
      `);

      MenuPage.hideAndClearDialoguePanel();

      this.initPageCode();
    });
  }
}
