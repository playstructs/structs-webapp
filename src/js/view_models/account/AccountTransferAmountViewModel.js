import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {PLAYER_TYPES} from "../../constants/PlayerTypes";

export class AccountTransferAmountViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.amountInputId = 'transferAmountInput';
    this.nextBtnId = 'transferAmountNextBtn';
    this.gameState.setTransferAmount(0);
    this.maxTransfer = Math.min(parseInt(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha) || 0, 99);
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    const amountInput = document.getElementById(this.amountInputId);
    const decreaseBtn = amountInput.previousElementSibling;
    const increaseBtn = amountInput.nextElementSibling;

    const inputStepperChangeHandler = () => {
      const nextBtn = document.getElementById(this.nextBtnId);
      if (
        0 < document.getElementById(this.amountInputId).value
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
      this.gameState.setTransferAmount(parseInt(document.getElementById(this.amountInputId).value));
      MenuPage.router.goto('Account', 'recipientSearch');
    })
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
