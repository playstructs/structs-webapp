import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";
import {TX_STATUS} from "../../models/SigningTransaction";
import {waitForTransferSource} from "../../util/TransferCompletion";

export class AccountConfirmTransfer extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AlphaManager} alphaManager
   * @param {PlayerSearchResultDTO|object} playerSearchResultDTO
   */
  constructor(
    gameState,
    guildAPI,
    alphaManager,
    playerSearchResultDTO
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.alphaManager = alphaManager;
    this.playerSearchResultDTO = playerSearchResultDTO;
    this.numberFormatter = new NumberFormatter();
    this.cancelBtnId = 'confirm-transfer-cancel-btn';
    this.transferBtnId = 'confirm-transfer-transfer-btn';
    this.transferring = false;
  }

  initPageCode() {
    document.getElementById(this.cancelBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'index');
    });
    document.getElementById(this.transferBtnId).addEventListener('click', () => this.transfer());
  }

  async transfer() {
    if (this.transferring) return;
    this.transferring = true;
    const recipient = {...this.playerSearchResultDTO};
    const amount = this.gameState.transferAmount;
    const account = this.gameState.signingAccount.address;
    const options = new MenuWaitingOptions();
    options.headerBtnLabel = 'Transferring...';
    options.waitingAnimation = 'ALPHA_TRANSFER';
    options.hasDoNotCloseMessage = false;
    MenuPage.router.goto('Generic', 'menuWaiting', options, {replace: true});
    const signal = MenuPage.router.navigationSignal;
    const active = () => !signal.aborted && this.gameState.signingAccount?.address === account;
    const returnToConfirmation = () => {
      if (!active()) return;
      this.gameState.setTransferAmount(amount);
      MenuPage.router.goto('Account', 'confirmTransfer', recipient, {replace: true});
    };

    let tx;
    try {
      tx = await this.alphaManager.transferAlpha(recipient.address, amount, recipient.id ?? null, signal);
    } catch (error) {
      // Enqueue failures are unsent; an uncertain broadcast never rejects this waiter.
      if (active()) {
        console.warn('[AccountConfirmTransfer] transfer unavailable:', error);
        returnToConfirmation();
      }
      return;
    }
    if (!active()) return;
    if (tx.status === TX_STATUS.DROPPED || tx.status === TX_STATUS.CANCELLED) {
      returnToConfirmation();
      return;
    }
    if (tx.status !== TX_STATUS.SUCCEEDED) return;
    try {
      const row = await waitForTransferSource(this.guildAPI, tx, signal);
      if (active()) MenuPage.router.goto('Account', 'transaction', {
        txId: row.id, comingFromPage: 1, hasBackToAccountBtn: true
      }, {replace: true});
    } catch (error) {
      // A committed transfer must never return to a screen offering to send it again.
      if (active()) console.warn('[AccountConfirmTransfer] completion needs matching evidence:', error);
    }
  }

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderNameHTML(playerSearchResultDTO) {
    let html = 'Non-Player Address';
    if (playerSearchResultDTO.id) {
      let tag = playerSearchResultDTO.tag
        ? `<span class="sui-mod-secondary">[${playerSearchResultDTO.tag}]</span>`
        : '';
      let username = playerSearchResultDTO.username
        ? playerSearchResultDTO.username
        : 'Name Redacted';
      html = `${tag} ${username}`;
    }
    return html;
  }

  render () {
    const amount = this.numberFormatter.format(this.gameState.transferAmount);

    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Confirm Transfer', true, () => {
      MenuPage.router.back();
    });

    MenuPage.setPageTemplateContent(`
      <div class="profile-layout">
      
        <div class="sui-data-card">
          <div class="sui-data-card-header sui-text-header">Transaction Details</div>
          <div class="sui-data-card-body">
          
            <div class="sui-data-card-row">
              <div>Amount</div>
              <div>
                <div class="sui-resource">
                  <span>${amount}</span>
                  <i class="sui-icon sui-icon-alpha-matter"></i>
                </div>
              </div>
            </div>
            
            <div class="sui-data-card-row">
              <div>Recipient</div>
              <div style="text-align: right">
                ${this.renderNameHTML(this.playerSearchResultDTO)}
                <br>
                ${
                  this.playerSearchResultDTO.id
                    ? '#' + this.playerSearchResultDTO.id
                    : this.playerSearchResultDTO.address
                }
              </div>
            </div>

          </div>
        </div>
        
        <div class="sui-screen-btn-flex-wrapper">
          <a 
            id="${this.cancelBtnId}"
            href="javascript: void(0)" 
            class="sui-screen-btn sui-mod-destructive"
          >Cancel</a>
          <a 
            id="${this.transferBtnId}"
            href="javascript: void(0)" 
            class="sui-screen-btn sui-mod-primary"
          >Transfer Now</a>
        </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
