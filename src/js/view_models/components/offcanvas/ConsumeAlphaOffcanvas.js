import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {GenericResourceComponent} from "../GenericResourceComponent";
import {NumberFormatter} from "../../../util/NumberFormatter";
import {Struct} from "../../../models/Struct";
import {StructType} from "../../../models/StructType";
import {STRUCT_ACTIONS} from "../../../constants/StructConstants";
import {GridStructListener} from "../../../grass_listeners/GridStructListener";

export class ConsumeAlphaOffcanvas extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {AlphaManager} alphaManager
   * @param {GrassManager} grassManager
   * @param {Struct} struct
   * @param {StructType} structType
   */
  constructor(
    gameState,
    alphaManager,
    grassManager,
    struct,
    structType
  ) {
    super(gameState);
    this.alphaManager = alphaManager;
    this.grassManager = grassManager;
    this.struct = struct;
    this.structType = structType;

    this.amountInputId = 'consumeAlphaAmountInput';
    this.consumeAlphaBtnId = 'consumeAlphaBtn';
    this.projectedSupplyId = 'projectedSupply';
    this.gameState.setTransferAmount(0);
    this.maxAlpha = parseInt(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha) || 0;
    this.preexistingSupply = this.struct.fuel * this.structType.generating_rate;

    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    const amountInput = document.getElementById(this.amountInputId);
    const decreaseBtn = amountInput.previousElementSibling;
    const increaseBtn = amountInput.nextElementSibling;
    const projectSupply = document.getElementById(`${this.projectedSupplyId}-value`);

    const inputStepperChangeHandler = () => {
      const consumeAlphaBtn = document.getElementById(this.consumeAlphaBtnId);
      const amount = parseInt(document.getElementById(this.amountInputId).value);
      if (0 < amount && amount <= this.maxAlpha) {
        consumeAlphaBtn.disabled = false;
        consumeAlphaBtn.classList.add('sui-mod-primary');
        consumeAlphaBtn.classList.remove('sui-mod-disabled');
      } else {
        consumeAlphaBtn.disabled = true;
        consumeAlphaBtn.classList.add('sui-mod-disabled');
        consumeAlphaBtn.classList.remove('sui-mod-primary');
      }

      projectSupply.innerText = this.numberFormatter.format(this.preexistingSupply + (amount * this.structType.generating_rate));
    }

    decreaseBtn.addEventListener('click', inputStepperChangeHandler);
    increaseBtn.addEventListener('click', inputStepperChangeHandler);
    amountInput.addEventListener('input', inputStepperChangeHandler);

    document.getElementById(this.consumeAlphaBtnId).addEventListener('click', () => {
      this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.CONSUME_ALPHA);
      this.gameState.actionBarLock.lock();

      this.grassManager.registerListener(new GridStructListener(this.gameState, this.struct.id));

      const amount = parseInt(document.getElementById(this.amountInputId).value);
      this.alphaManager.structGeneratorInfuse(this.struct.id, amount).then();
      MenuPage.sui.offcanvas.close();
    })
  }

  /**
   * @return {string}
   */
  renderHTML() {
    return `
        <div class="offcanvas-consume-alpha-layout">
          <div>Spend Alpha Matter to generate energy.</div>
          
          <div>
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
                max="${this.maxAlpha}"
                value="0"
              >
              <button class="sui-screen-btn sui-mod-secondary">
                <i class="sui-icon sui-icon-md icon-add"></i>
              </button>
            </div>
          </div>
          
          <div class="sui-data-card-row">
            <div>
              Projected<br>
              Supply:
            </div>
            <div>
              ${
                this.genericResourceComponent.renderHTML(
                  this.projectedSupplyId,
                  'sui-icon-energy',
                  'Project Energy Supply',
                  this.numberFormatter.format(this.preexistingSupply)
                )
              }
            </div>
          </div>
          
          <div class="sui-screen-btn-flex-wrapper">
            <button id="${this.consumeAlphaBtnId}" class="sui-screen-btn sui-mod-disabled" disabled>Consume Alpha</button>
          </div>
        </div>
     `;
  }

  render() {
    MenuPage.sui.offcanvas.setHeader('Consume Alpha');
    MenuPage.sui.offcanvas.setContent(this.renderHTML());
    MenuPage.sui.offcanvas.open(MenuPage.sui.offcanvas.narrow);
    this.initPageCode();
  }
}
