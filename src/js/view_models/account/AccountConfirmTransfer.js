import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {MenuWaitingOptions} from "../../options/MenuWaitingOptions";
import {TransferSentListener} from "../../grass_listeners/TransferSentListener";

export class AccountConfirmTransfer extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   * @param {PlayerSearchResultDTO|object} playerSearchResultDTO
   */
  constructor(
    gameState,
    guildAPI,
    alphaManager,
    grassManager,
    playerSearchResultDTO
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.alphaManager = alphaManager;
    this.grassManager = grassManager;
    this.playerSearchResultDTO = playerSearchResultDTO;
    this.numberFormatter = new NumberFormatter();
    this.cancelBtnId = 'confirm-transfer-cancel-btn';
    this.transferBtnId = 'confirm-transfer-transfer-btn';
  }

  initPageCode() {
    document.getElementById(this.cancelBtnId).addEventListener('click', () => {
      MenuPage.router.goto('Account', 'index');
    });
    document.getElementById(this.transferBtnId).addEventListener('click', () => {
      const options = new MenuWaitingOptions();
      options.headerBtnLabel = 'Transferring...';
      options.waitingAnimation = 'ALPHA_TRANSFER';
      options.hasDoNotCloseMessage = false;

      MenuPage.router.goto('Generic', 'menuWaiting', options);

      this.grassManager.registerListener(new TransferSentListener(
        this.gameState,
        this.gameState.signingAccount.address,
        this.playerSearchResultDTO.address,
        this.gameState.transferAmount
      ));

      this.alphaManager.transferAlpha(this.playerSearchResultDTO.address, this.gameState.transferAmount).then();
    });
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

  /**
   * @param {PlayerSearchResultDTO} playerSearchResultDTO
   * @return {string}
   */
  renderRecipientDataRows(playerSearchResultDTO) {
    return `
      <div class="sui-data-card-row">
        <div>Recipient</div>
        <div>${this.renderNameHTML(playerSearchResultDTO)}</div>
      </div>
    `
    + playerSearchResultDTO.id
      ? `
        <div class="sui-data-card-row">
          <div>Player ID</div>
          <div>${playerSearchResultDTO.id}</div>
        </div>
      `
      : `
        <div class="sui-data-card-row">
          <div>Blockchain Address</div>
          <div>${playerSearchResultDTO.address}</div>
        </div>
      `;
  }

  render () {
    const amount = this.numberFormatter.format(this.gameState.transferAmount);
    const recipientDataRows = this.renderRecipientDataRows(this.playerSearchResultDTO);

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
            
            ${recipientDataRows}

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
