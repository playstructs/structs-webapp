import {AbstractViewModelComponent} from "../../../framework/AbstractViewModelComponent";
import {MenuPage} from "../../../framework/MenuPage";
import {PLAYER_TYPES} from "../../../constants/PlayerTypes";
import {GenericResourceComponent} from "../GenericResourceComponent";
import {NumberFormatter} from "../../../util/NumberFormatter";
import {Struct} from "../../../models/Struct";
import {StructType} from "../../../models/StructType";
import {STRUCT_ACTIONS} from "../../../constants/StructConstants";
import {EVENTS} from "../../../constants/Events";
import {CHAIN} from "../../../constants/ChainConstants";
import {TX_STATUS} from "../../../models/SigningTransaction";
import {generatorPreview} from "../../../util/GeneratorState";
import {waitForGeneratorRefresh} from "../../../util/GeneratorCompletion";
import {maxQueryHeight, protocolAtHeight} from "../../../util/ChainProtocol";

export class ConsumeAlphaOffcanvas extends AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   * @param {AlphaManager} alphaManager
   * @param {Struct} struct
   * @param {StructType} structType
   */
  constructor(
    gameState,
    alphaManager,
    struct,
    structType
  ) {
    super(gameState);
    this.alphaManager = alphaManager;
    this.struct = struct;
    this.structType = structType;

    this.amountInputId = 'consumeAlphaAmountInput';
    this.consumeAlphaBtnId = 'consumeAlphaBtn';
    this.projectedSupplyId = 'projectedSupply';
    this.maxAlpha = '0';
    this.preexistingSupply = '';
    this.state = null;
    this.busy = false;
    this.refreshVersion = 0;
    this.refreshPromise = null;
    this.retryDelay = 2000;
    this.timer = null;

    this.genericResourceComponent = new GenericResourceComponent(gameState);
    this.numberFormatter = new NumberFormatter();
  }

  initPageCode() {
    this.signal = MenuPage.sui.offcanvas.signal;
    this.sessionSignal = this.alphaManager.signingClientManager.sessionSignal;
    this.keyPlayer = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
    this.ownerId = this.keyPlayer.id;
    this.account = this.gameState.signingAccount?.address;
    this.input = document.getElementById(this.amountInputId);
    this.button = document.getElementById(this.consumeAlphaBtnId);
    this.decrease = this.input.previousElementSibling;
    this.increase = this.input.nextElementSibling;
    this.supply = document.getElementById(`${this.projectedSupplyId}-value`);
    const retire = () => {
      if (MenuPage.sui.offcanvas.signal === this.signal) MenuPage.sui.offcanvas.close();
    };
    this.sessionSignal.addEventListener('abort', retire, {once: true});
    this.signal.addEventListener('abort', () => {
      clearTimeout(this.timer);
      this.sessionSignal.removeEventListener('abort', retire);
    }, {once: true});
    const options = {signal: this.signal};
    this.input.addEventListener('input', () => this.updateControls(), options);
    this.decrease.addEventListener('click', event => {
      event.preventDefault();
      const amount = this.amount();
      if (!this.busy && amount !== null && amount > 0n) {
        this.input.value = (amount - 1n).toString();
      }
      this.updateControls();
    }, options);
    this.increase.addEventListener('click', event => {
      event.preventDefault();
      const amount = this.amount();
      if (!this.busy && this.state && amount !== null && amount < BigInt(this.state.maxAlpha)) {
        this.input.value = (amount + 1n).toString();
      }
      this.updateControls();
    }, options);
    this.button.addEventListener('click', () => this.submit(), options);
    window.addEventListener(EVENTS.ALPHA_COUNT_CHANGED, event => {
      if (event.playerType === PLAYER_TYPES.PLAYER) this.invalidate();
    }, options);
    window.addEventListener(EVENTS.RENDER_STRUCT, event => {
      if (event.struct?.id === this.struct.id) this.invalidate();
    }, options);
    for (const name of [EVENTS.FLEET_CHANGED, EVENTS.GRASS_CONNECTED, 'focus', 'online']) {
      window.addEventListener(name, () => this.invalidate(), options);
    }
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, () => {
      if (!this.isSessionCurrent()) return retire();
      if (
        this.state
        && protocolAtHeight(CHAIN.ID, maxQueryHeight(this.state.height, this.gameState.currentBlockHeight)) !== this.state.protocol
      ) {
        this.invalidate(true);
      }
    }, options);
    this.updateControls();
    if (this.sessionSignal.aborted) {
      retire();
    } else {
      this.refresh();
    }
  }

  /**
   * @return {boolean} whether the signed-in player and account are still the ones this offcanvas opened for
   */
  isSessionCurrent() {
    return !this.sessionSignal.aborted
      && this.keyPlayer === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
      && this.ownerId === this.keyPlayer.id
      && this.account === this.gameState.signingAccount?.address;
  }

  /**
   * @return {boolean} whether this offcanvas is still open and its session current
   */
  isCurrent() {
    return !this.signal.aborted
      && this.isSessionCurrent()
      && document.getElementById(this.amountInputId) === this.input;
  }

  /**
   * @return {bigint|null} the entered whole amount, or null when the input is not one
   */
  amount() {
    return /^[0-9]{1,14}$/.test(this.input.value) ? BigInt(this.input.value) : null;
  }

  updateControls() {
    if (!this.isCurrent()) return;
    const amount = this.amount();
    let valid = false;
    let power = '';
    if (this.state && amount !== null) {
      try {
        power = this.numberFormatter.formatExact(generatorPreview(this.state, amount).toString());
        valid = amount > 0n;
      } catch {
        /* Keep the user's amount intact when it is no longer affordable. */
      }
    }
    const unavailable = this.busy || !this.state || this.gameState.actionBarLock.isLocked();
    this.input.disabled = unavailable;
    this.input.max = this.state?.maxAlpha ?? '0';
    this.decrease.disabled = unavailable || amount === null || amount <= 0n;
    this.increase.disabled = unavailable || amount === null || amount >= BigInt(this.input.max);
    this.button.disabled = unavailable || !valid;
    this.button.classList.toggle('sui-mod-primary', !this.button.disabled);
    this.button.classList.toggle('sui-mod-disabled', this.button.disabled);
    this.supply.innerText = power;
  }

  /**
   * Re-reads the generator state. The current state stays usable meanwhile so
   * routine refreshes do not disable the input; submit always re-reads first.
   *
   * @param {boolean} discard true when the current state can no longer be used
   */
  invalidate(discard = false) {
    if (!this.isCurrent()) return;
    this.refreshVersion++;
    if (discard) {
      this.state = null;
      this.updateControls();
    }
    clearTimeout(this.timer);
    if (!this.busy && !this.refreshPromise) {
      this.timer = setTimeout(() => this.refresh(), 100);
    }
  }

  /**
   * Read the generator state, joining a read already in flight, and schedule
   * the next one.
   *
   * @return {Promise<void>}
   */
  async refresh() {
    if (!this.isCurrent()) return;
    if (this.refreshPromise) return this.refreshPromise;
    clearTimeout(this.timer);
    const version = this.refreshVersion;
    this.refreshPromise = (async () => {
      try {
        const state = await this.alphaManager.getGeneratorState(this.struct.id, this.signal);
        if (this.isCurrent() && version === this.refreshVersion) {
          this.state = state;
          this.maxAlpha = state.maxAlpha;
          this.retryDelay = 2000;
        }
      } catch (error) {
        if (this.isCurrent()) {
          this.state = null;
          console.debug('[ConsumeAlpha] generator snapshot unavailable:', error);
        }
      } finally {
        this.refreshPromise = null;
        if (this.isCurrent()) {
          this.updateControls();
          if (!this.busy) {
            const delay = version !== this.refreshVersion ? 100 : this.state ? 30000 : this.retryDelay;
            this.retryDelay = Math.min(this.retryDelay * 2, 30000);
            this.timer = setTimeout(() => {
              this.invalidate();
              this.refresh();
            }, delay);
          }
        }
      }
    })();
    return this.refreshPromise;
  }

  /**
   * Re-read the generator state, then queue the infusion for the entered
   * amount under the action bar lock.
   */
  async submit() {
    if (!this.isCurrent() || this.button.disabled || this.busy || this.gameState.actionBarLock.isLocked()) return;
    const amount = this.amount();
    this.busy = true;
    this.state = null;
    this.refreshVersion++;
    this.updateControls();
    await this.refresh();
    if (!this.isCurrent()) return;
    try {
      if (!this.state || amount === null || amount <= 0n) return;
      // Recheck the complete choice without shrinking it.
      generatorPreview(this.state, amount);
      const lock = this.gameState.actionBarLock;
      if (lock.isLocked()) return;
      lock.setCurrentAction(STRUCT_ACTIONS.CONSUME_ALPHA);
      lock.setActionSourceStruct(this.struct);
      const signal = lock.lock({completionManaged: true});
      const cancel = () => {
        if (!signal.aborted) lock.clear();
      };
      this.sessionSignal.addEventListener('abort', cancel, {once: true});
      const settled = this.alphaManager.structGeneratorInfuse(this.struct.id, amount, this.state, signal);
      this.operation = this.finishOperation(settled, signal)
        .finally(() => this.sessionSignal.removeEventListener('abort', cancel));
      // Only the preview ends; the operation has its own scope.
      MenuPage.sui.offcanvas.close();
    } catch (error) {
      console.debug('[ConsumeAlpha] selected amount is unavailable:', error);
    } finally {
      this.busy = false;
      if (this.isCurrent()) {
        this.updateControls();
        this.timer = setTimeout(() => this.invalidate(), 2000);
      }
    }
  }

  /**
   * Follow a queued infusion to its indexed result and update the struct,
   * releasing the action bar lock once the operation is finished.
   *
   * @param {Promise<SigningTransaction>} settled
   * @param {AbortSignal} signal the action bar lock's scope for this operation
   */
  async finishOperation(settled, signal) {
    let observed = false;
    let finished = false;
    try {
      const tx = await settled;
      observed = true;
      signal.throwIfAborted();
      if (!this.isSessionCurrent()) return;
      if (tx.status !== TX_STATUS.SUCCEEDED) {
        finished = true;
        return;
      }
      const {result, player} = await waitForGeneratorRefresh(
        this.gameState.guildAPI,
        tx,
        signal,
        () => this.gameState.currentBlockHeight
      );
      signal.throwIfAborted();
      if (!this.isSessionCurrent()) return;
      this.keyPlayer.setPlayer(player, this.gameState.currentBlockHeight);
      const current = this.keyPlayer.structs[this.struct.id];
      // Do not stamp unrelated older struct fields with a new power boundary.
      if (
        current
        && result.data
        && (
          !current.generator_snapshot_meta
          || BigInt(current.generator_snapshot_meta.height) <= BigInt(result.meta.height)
        )
      ) {
        current.generator_fuel_p = result.data.fuel_p;
        current.generator_power_p = result.data.power_p;
        current.generator_positions_ready = true;
        current.generator_snapshot_meta = result.meta;
        current.fuel = (BigInt(result.data.fuel_p) / 1000000n).toString();
        current.generator_power = (BigInt(result.data.power_p) / 1000n).toString();
      }
      finished = true;
    } catch (error) {
      // An enqueue refusal: no signed operation was observed.
      if (!observed) finished = true;
      if (!signal.aborted) console.debug('[ConsumeAlpha] operation observer stopped:', error);
    } finally {
      // Clearing or replacing the action aborts this exact scope, so an old
      // callback never clears a newer operation, including a later generator burn.
      if (finished && !signal.aborted && this.isSessionCurrent()) this.gameState.actionBarLock.clear();
    }
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
                  this.preexistingSupply
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
