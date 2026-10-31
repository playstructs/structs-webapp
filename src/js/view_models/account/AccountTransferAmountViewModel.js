import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";
import {transferLimit} from "../../util/TransferLimit";
import {pollUntil} from "../../util/PollUntil";

export class AccountTransferAmountViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.amountInputId = 'transferAmountInput';
    this.nextBtnId = 'transferAmountNextBtn';
    this.gameState.setTransferAmount(0);
    this.maxTransfer = 0;
    this.fundsReady = false;
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    const amountInput = document.getElementById(this.amountInputId);
    const decreaseBtn = amountInput.previousElementSibling;
    const increaseBtn = amountInput.nextElementSibling;

    const inputStepperChangeHandler = () => {
      const nextBtn = document.getElementById(this.nextBtnId);
      if (
        this.fundsReady
        && /^[1-9][0-9]?$/.test(document.getElementById(this.amountInputId).value)
        && document.getElementById(this.amountInputId).value <= this.maxTransfer
      ) {
        nextBtn.disabled = false;
        nextBtn.classList.add('sui-mod-primary');
        nextBtn.classList.remove('sui-mod-disabled');
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.add('sui-mod-disabled');
        nextBtn.classList.remove('sui-mod-primary');
      }
    }

    decreaseBtn.addEventListener('click', inputStepperChangeHandler);
    increaseBtn.addEventListener('click', inputStepperChangeHandler);
    amountInput.addEventListener('input', inputStepperChangeHandler);

    document.getElementById(this.nextBtnId).addEventListener('click', () => {
      if (!this.fundsReady || !/^[1-9][0-9]?$/.test(amountInput.value) || Number(amountInput.value) > this.maxTransfer) return;
      this.gameState.setTransferAmount(parseInt(document.getElementById(this.amountInputId).value));
      MenuPage.router.goto('Account', 'recipientSearch');
    });

    amountInput.disabled = true;
    decreaseBtn.disabled = true;
    increaseBtn.disabled = true;
    const signal = MenuPage.router.navigationSignal;
    const ownerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    this.loadLimit(ownerId, signal).then(maxTransfer => {
      if (signal.aborted || this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id !== ownerId) return;
      this.maxTransfer = maxTransfer;
      this.fundsReady = true;
      amountInput.max = this.maxTransfer;
      amountInput.disabled = false;
      decreaseBtn.disabled = Number(amountInput.value) <= 0;
      increaseBtn.disabled = Number(amountInput.value) >= this.maxTransfer;
      inputStepperChangeHandler();
    }).catch(error => {
      if (!signal.aborted) console.debug('[AccountTransferAmount] funds unavailable:', error);
    });
  }

  async loadLimit(ownerId, signal) {
    return pollUntil(async () => {
      const player = await this.guildAPI.getPlayer(ownerId, {signal, timeoutMs: 16000});
      signal.throwIfAborted();
      return transferLimit(player, ownerId, this.gameState.currentBlockHeight);
    }, signal, {label: '[AccountTransferAmount] funds unavailable:'});
  }

  render () {
    MenuPage.enablePageTemplate(MenuPage.navItemAccountId);

    MenuPage.setPageTemplateHeaderBtn('Amount', true, () => {
      MenuPage.router.goto('Account', 'transfers');
    });

    MenuPage.setPageTemplateContent(`
      <div class="common-layout-col">
        
        <div>How much Alpha Matter do you want to send?</div>
        
        <div class="sui-input-stepper">
            <button class="sui-screen-btn sui-mod-secondary">
              <i class="sui-icon sui-icon-md icon-subtract"></i>
            </button>
            <input
              id="${this.amountInputId}"
              name="${this.amountInputId}"
              type="number"
              step="1"
              min="0"
              max="${this.maxTransfer}"
              value="0"
            >
            <button class="sui-screen-btn sui-mod-secondary">
              <i class="sui-icon sui-icon-md icon-add"></i>
            </button>
            <button id="${this.nextBtnId}" class="sui-screen-btn sui-mod-disabled" disabled>Next</button>
          </div>
        
      </div>
    `);

    MenuPage.hideAndClearDialoguePanel();

    this.initPageCode();
  }
}
