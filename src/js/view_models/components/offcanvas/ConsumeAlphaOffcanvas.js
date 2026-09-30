import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {GenericResourceComponent} from "../GenericResourceComponent";
import {Struct} from "../../../models/Struct";
import {StructType} from "../../../models/StructType";
import {STRUCT_ACTIONS} from "../../../constants/StructConstants";
import {GridStructListener} from "../../../grass_listeners/GridStructListener";
import {ConsumeAlphaChangeListener} from "../../../grass_listeners/ConsumeAlphaChangeListener";
import {parse, baseToDisplayDecimal, fmt} from "../../../util/Units";

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
    this.gameState.setTransferAmount('0');
    this.maxAlpha = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha_p ?? 0n;
    this.maxDisplay = baseToDisplayDecimal(this.maxAlpha);
    const rate = this.structType.generating_rate_p ?? 0n;
    this.preexistingSupply = (this.struct.fuel_p ?? 0n) * rate;

    this.genericResourceComponent = new GenericResourceComponent(gameState);
  }

  initPageCode() {
    MenuPage.sui.inputStepper.autoInitAll();

    const amountInput = document.getElementById(this.amountInputId);
    const decreaseBtn = amountInput.previousElementSibling;
    const increaseBtn = amountInput.nextElementSibling;
    const projectSupply = document.getElementById(`${this.projectedSupplyId}-value`);

    const inputStepperChangeHandler = () => {
      const consumeAlphaBtn = document.getElementById(this.consumeAlphaBtnId);
      const text = document.getElementById(this.amountInputId).value;
      const amount = parse(text, 'ualpha');
      
      if (amount && amount > 0n && amount <= this.maxAlpha) {
        consumeAlphaBtn.disabled = false;
        consumeAlphaBtn.classList.add('sui-mod-primary');
        consumeAlphaBtn.classList.remove('sui-mod-disabled');
      } else {
        consumeAlphaBtn.disabled = true;
        consumeAlphaBtn.classList.add('sui-mod-disabled');
        consumeAlphaBtn.classList.remove('sui-mod-primary');
      }

      if (amount && amount > 0n) {
        const rate = this.structType.generating_rate_p ?? 0n;
        const projectedPower = this.preexistingSupply + (amount * rate);
        projectSupply.innerText = fmt(projectedPower, 'mw');
      } else {
        projectSupply.innerText = fmt(this.preexistingSupply, 'mw');
      }
    }

    decreaseBtn.addEventListener('click', inputStepperChangeHandler);
    increaseBtn.addEventListener('click', inputStepperChangeHandler);
    amountInput.addEventListener('input', inputStepperChangeHandler);

    document.getElementById(this.consumeAlphaBtnId).addEventListener('click', () => {
      const text = document.getElementById(this.amountInputId).value;
      const amount = parse(text, 'ualpha');
      
      if (!amount || amount === 0n) {
        return;
      }
      
      this.gameState.actionBarLock.setCurrentAction(STRUCT_ACTIONS.CONSUME_ALPHA);
      this.gameState.actionBarLock.lock();

      this.grassManager.registerListener(new GridStructListener(this.gameState, this.struct.id));
      this.grassManager.registerListener(new ConsumeAlphaChangeListener(this.gameState, this.struct.id));

      this.alphaManager.structGeneratorInfuse(this.struct.id, amount.toString()).then((result) => {
        if (!this.alphaManager.isSettledSuccess(result)) {
          this.gameState.actionBarLock.clear();
          console.error('Infusion failed or settlement unsuccessful', result?.error);
        }
      }).catch((error) => {
        this.gameState.actionBarLock.clear();
        console.error('Infusion error:', error);
      });
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
                data-decimals="6"
                min="0"
                max="${this.maxDisplay}"
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
                  fmt(this.preexistingSupply, 'mw')
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
