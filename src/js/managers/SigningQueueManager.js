import {TimeoutError} from "@cosmjs/stargate";
import {EVENTS} from "../constants/Events";
import {FEE} from "../constants/Fee";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {SigningTransaction, TX_STATUS} from "../models/SigningTransaction";
import {SigningTransactionSettledEvent} from "../events/SigningTransactionSettledEvent";

/**
 * Fallback average block time (ms) used by the estimate helpers until the
 * rolling sample buffer has >= 2 timestamps. Tune to the observed chain rate.
 *
 * @type {number}
 */
const DEFAULT_BLOCK_TIME_MS = 1500;

/**
 * How many block timestamps to keep for the rolling average.
 *
 * @type {number}
 */
const BLOCK_TIME_SAMPLE_SIZE = 20;

/**
 * Blocks to poll the chain for a tx after a cosmjs TimeoutError before treating
 * it as a genuine failure.
 *
 * @type {number}
 */
const TIMEOUT_POLL_BLOCKS = 5;

/**
 * Validate that a payload is safe to persist as JSON. Rejects anything that
 * would corrupt the store or fail to round-trip (undefined, BigInt, functions,
 * symbols, class instances).
 *
 * @param {object} payload
 * @throws {Error} when the payload is not a serializable plain object.
 */
export function assertSerializable(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('SigningQueueManager: payload must be a plain object.');
  }

  const visit = (value, path) => {
    if (value === null) {
      return;
    }
    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      if (type === 'number' && !Number.isFinite(value)) {
        throw new Error(`SigningQueueManager: non-finite number at ${path}`);
      }
      return;
    }
    if (type === 'undefined') {
      throw new Error(`SigningQueueManager: undefined value at ${path}`);
    }
    if (type === 'bigint') {
      throw new Error(`SigningQueueManager: BigInt value at ${path} (stringify before enqueue)`);
    }
    if (type === 'function' || type === 'symbol') {
      throw new Error(`SigningQueueManager: ${type} value at ${path}`);
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => visit(item, `${path}[${i}]`));
      return;
    }
    // Plain object only — reject class instances with a custom prototype.
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      throw new Error(`SigningQueueManager: non-plain object at ${path}`);
    }
    for (const key of Object.keys(value)) {
      visit(value[key], `${path}.${key}`);
    }
  };

  for (const key of Object.keys(payload)) {
    visit(payload[key], key);
  }
}

/**
 * Owns the transaction queue: two lanes (immediate FIFO + charge-scheduled),
 * lazy charge gating, persistence, broadcast loop, and settlement.
 *
 * SigningClientManager builds plain payloads and delegates here; this class is
 * the single authority for *when and how* a transaction is sent. It never
 * writes KeyPlayer.lastActionBlockHeight — GRASS (KeyPlayerLastActionListener)
 * is the sole gameplay writer. An internal `scheduleAnchorHeight` bridges the
 * 1-2 block GRASS lag and is clamped opportunistically once GRASS catches up.
 */
export class SigningQueueManager {
  static STORAGE_KEY_PREFIX = 'signingQueue';
  static STORAGE_VERSION = 1;
  static DEFAULT_RETRY_LIMIT = 2;
  /** 30 minutes — older persisted snapshots are quarantined, not replayed. */
  static MAX_QUEUE_AGE_MS = 30 * 60 * 1000;

  /**
   * @param {GameState} gameState
   * @param {object} deps
   * @param {import('@cosmjs/proto-signing').Registry} deps.registry
   * @param {string} deps.wsUrl - Endpoint, used to scope the storage key per chain.
   */
  constructor(gameState, {registry, wsUrl}) {
    this.gameState = gameState;
    this.registry = registry;
    this.wsUrl = wsUrl;

    /** @type {SigningTransaction[]} Non-charge FIFO lane. */
    this.immediateQueue = [];
    /** @type {SigningTransaction[]} Charge-scheduled lane; head gated lazily. */
    this.chargeQueue = [];
    /** @type {SigningTransaction|null} Tx currently being broadcast. */
    this.inFlight = null;
    /** @type {number} Shared per-block broadcast governor (one tx/block/address). */
    this.lastBroadcastHeight = 0;
    /** @type {number} Bridges GRASS lag between successful charge broadcasts. */
    this.scheduleAnchorHeight = 0;
    /** @type {Map<string, {resolve: function}>} In-memory only; backs whenSettled. */
    this.settlementWaiters = new Map();
    /** @type {number[]} In-memory ring buffer of block timestamps for ETA math. */
    this.blockTimestamps = [];
    /** @type {boolean} Guards against double rehydration. */
    this.rehydrated = false;

    // loadPersistedState() is intentionally NOT called here — the storage key
    // needs the signing account address, which is unknown until wallet connect
    // (Review hardening #1). SigningClientManager.initSigningClient triggers it.
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, () => {
      this.recordBlockTime();
      this.transactOnBlock();
    });
    // No GRASS listener — projectedChargeAt reads live lastAction each block.
  }

  // ---------------------------------------------------------------------------
  // Enqueue
  // ---------------------------------------------------------------------------

  /**
   * @param {string} typeUrl
   * @param {object} payload - Plain JSON object, no `creator`.
   * @param {object} [options]
   * @return {string} transaction id
   */
  enqueueImmediate(typeUrl, payload, options = {}) {
    return this.#enqueue(typeUrl, payload, false, null, options);
  }

  /**
   * @param {string} typeUrl
   * @param {object} payload - Plain JSON object, no `creator`.
   * @param {number} chargeCost
   * @param {object} [options]
   * @return {string} transaction id
   */
  enqueueCharge(typeUrl, payload, chargeCost, options = {}) {
    return this.#enqueue(typeUrl, payload, true, chargeCost, options);
  }

  /**
   * @param {string} typeUrl
   * @param {object} payload
   * @param {boolean} requiresCharge
   * @param {number|null} chargeCost
   * @param {object} options
   * @return {string}
   */
  #enqueue(typeUrl, payload, requiresCharge, chargeCost, options) {
    assertSerializable(payload);

    // v1: per-tx retryLimit override is accepted but the global default applies
    // unless explicitly provided. Wiring a caller is a one-liner here later.
    const retryLimit = typeof options.retryLimit === 'number'
      ? options.retryLimit
      : SigningQueueManager.DEFAULT_RETRY_LIMIT;

    const tx = SigningTransaction.create({
      typeUrl,
      payload,
      requiresCharge,
      chargeCost,
      retryLimit,
      accountAddress: this.gameState.signingAccount?.address ?? null,
      enqueuedAtBlock: this.gameState.currentBlockHeight,
    });

    this.appendToLane(tx);
    return tx.id;
  }

  /**
   * Push a transaction onto the tail of its lane and persist. Shared by enqueue
   * and the failure-retry path — retry is identical to a fresh enqueue at tail.
   *
   * @param {SigningTransaction} tx
   */
  appendToLane(tx) {
    tx.status = TX_STATUS.QUEUED;
    tx.error = tx.error ?? null;
    const lane = tx.requiresCharge ? this.chargeQueue : this.immediateQueue;
    lane.push(tx);
    this.persist();
  }

  // ---------------------------------------------------------------------------
  // Scheduling (lazy — no stored schedule)
  // ---------------------------------------------------------------------------

  /**
   * GRASS-confirmed last action for the PLAYER (never raid key players).
   *
   * @return {number}
   */
  getGrassLastAction() {
    const player = this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER];
    return player ? player.lastActionBlockHeight : 0;
  }

  /**
   * Base block for charge math: the later of GRASS lastAction and the internal
   * anchor. Opportunistically clamps the anchor when GRASS has caught up.
   *
   * @return {number}
   */
  getWalkingBase() {
    this.clampScheduleAnchor();
    return Math.max(this.getGrassLastAction(), this.scheduleAnchorHeight);
  }

  /**
   * Anchor clamp rule (single source of truth): once GRASS reflects (or passes)
   * the anchor, reset the anchor to 0 so GRASS alone drives the base via max().
   * This avoids double-counting a drain that GRASS has already accounted for.
   */
  clampScheduleAnchor() {
    if (this.getGrassLastAction() >= this.scheduleAnchorHeight) {
      this.scheduleAnchorHeight = 0;
    }
  }

  /**
   * Projected available charge at a given block, using the client `+1`
   * convention (charge(H) = H - (base + 1)).
   *
   * @param {number} blockHeight
   * @return {number}
   */
  projectedChargeAt(blockHeight) {
    return blockHeight - (this.getWalkingBase() + 1);
  }

  /**
   * Record a block timestamp for the rolling average block time.
   */
  recordBlockTime() {
    this.blockTimestamps.push(Date.now());
    if (this.blockTimestamps.length > BLOCK_TIME_SAMPLE_SIZE) {
      this.blockTimestamps.shift();
    }
  }

  /**
   * @return {number} average ms between blocks (falls back to default with <2 samples)
   */
  getAvgBlockMs() {
    const t = this.blockTimestamps;
    if (t.length < 2) {
      return DEFAULT_BLOCK_TIME_MS;
    }
    return (t[t.length - 1] - t[0]) / (t.length - 1);
  }

  /**
   * Internal block-ETA walker. Each charge item contributes `1 + chargeCost`
   * blocks past the walking base. Pure — never mutates state.
   *
   * @return {Array<{id: string, etaBlockHeight: number}>}
   */
  #estimateScheduleBlocks() {
    let walking = this.getWalkingBase();
    return this.chargeQueue.map((tx) => {
      walking = walking + 1 + tx.chargeCost;
      return {id: tx.id, etaBlockHeight: walking};
    });
  }

  /**
   * Public: estimated broadcast time per charge item. Pure / on-demand.
   *
   * @return {Array<{id: string, etaBlockHeight: number, blocksRemaining: number, etaMs: number, etaAt: number}>}
   */
  estimateScheduleTime() {
    const H = this.gameState.currentBlockHeight;
    const avg = this.getAvgBlockMs();
    return this.#estimateScheduleBlocks().map(({id, etaBlockHeight}) => {
      const blocksRemaining = Math.max(0, etaBlockHeight - H);
      return {
        id,
        etaBlockHeight,
        blocksRemaining,
        etaMs: blocksRemaining * avg,
        etaAt: Date.now() + blocksRemaining * avg,
      };
    });
  }

  /**
   * Public: per-item percentage of its total wait (from the walking base) that
   * has elapsed. 100 = broadcastable. Pure / on-demand.
   *
   * @return {Array<{id: string, percent: number}>}
   */
  estimateSchedulePercent() {
    const H = this.gameState.currentBlockHeight;
    const base = this.getWalkingBase();
    return this.#estimateScheduleBlocks().map(({id, etaBlockHeight}) => ({
      id,
      percent: Math.min(100, Math.max(0, ((H - base) / (etaBlockHeight - base)) * 100)),
    }));
  }

  // ---------------------------------------------------------------------------
  // Broadcast loop
  // ---------------------------------------------------------------------------

  /**
   * Block listener handler. Selects at most one transaction to broadcast this
   * block: charge head if its lazy gate passes, otherwise the immediate head.
   */
  transactOnBlock() {
    const H = this.gameState.currentBlockHeight;
    if (this.inFlight) {
      return;
    }
    if (!this.gameState.signingClient || !this.gameState.signingAccount?.address) {
      return;
    }
    if (this.lastBroadcastHeight >= H) {
      return;
    }

    const head = this.chargeQueue[0];
    if (head && this.projectedChargeAt(H) >= head.chargeCost) {
      this.chargeQueue.shift();
      this.broadcast(head);
      return;
    }
    // Charge head not ready (or empty) → use this block's slot for immediate lane.

    if (this.immediateQueue.length > 0) {
      const tx = this.immediateQueue.shift();
      this.broadcast(tx);
    }
  }

  /**
   * Sign and broadcast a single transaction. The only place `inFlight` is set
   * or cleared. Persists before the first await so a mid-flight refresh can
   * rehydrate.
   *
   * @param {SigningTransaction} tx
   * @return {Promise<void>}
   */
  async broadcast(tx) {
    tx.status = TX_STATUS.IN_FLIGHT;
    this.inFlight = tx;
    tx.broadcastAtBlock = this.gameState.currentBlockHeight;
    this.lastBroadcastHeight = this.gameState.currentBlockHeight;
    this.persist();

    // Multi-account / Review hardening #4: never sign with the wrong key. If the
    // active signer is not this tx's owner, hold it (restore to its lane head).
    if (tx.accountAddress && tx.accountAddress !== this.gameState.signingAccount.address) {
      console.warn(
        `[SigningQueueManager] Holding tx ${tx.id}: owner ${tx.accountAddress} != active signer ${this.gameState.signingAccount.address}`
      );
      this.inFlight = null;
      this.#restoreToLaneHead(tx);
      return;
    }

    let msg;
    try {
      msg = tx.toCosmosMsg(this.registry);
    } catch (err) {
      // Encoding bug — treat as a normal failure (retry/drop per policy).
      this.inFlight = null;
      this.#handleBroadcastFailure(tx, err);
      return;
    }

    try {
      const response = await this.gameState.signingClient.signAndBroadcast(
        this.gameState.signingAccount.address,
        [msg],
        FEE
      );
      this.#handleBroadcastResponse(tx, response);
    } catch (err) {
      if (err instanceof TimeoutError && err.txId) {
        // Submitted but not yet included — it frequently lands a block or two
        // later. Poll before treating as failure to avoid duplicate actions.
        const found = await this.pollForTx(err.txId);
        if (found) {
          this.#handleBroadcastResponse(tx, {
            code: found.code,
            transactionHash: found.hash,
            height: found.height,
            rawLog: found.rawLog,
            msgResponses: found.msgResponses,
            events: found.events,
          });
          return;
        }
      }
      this.inFlight = null;
      this.#handleBroadcastFailure(tx, err);
    }
  }

  /**
   * Process a resolved broadcast response (from signAndBroadcast or a successful
   * post-timeout poll). Mirrors the always-on logging from the old transactQueue.
   *
   * @param {SigningTransaction} tx
   * @param {object} response
   */
  #handleBroadcastResponse(tx, response) {
    tx.response = {
      code: response.code,
      transactionHash: response.transactionHash,
      height: response.height,
      rawLog: response.rawLog ?? null,
    };

    if (response.code === 0) {
      console.debug('Transaction Successful: Code 0');
    } else {
      console.warn('Transaction Failed: Code ', response.code);
    }
    console.debug('Transaction Hash:', response.transactionHash);
    console.debug('Height:', response.height);
    if (Array.isArray(response.msgResponses)) {
      try {
        tx.msgResponses = response.msgResponses.map((m) => ({
          typeUrl: m.typeUrl,
          value: this.registry.decode(m),
        }));
        console.debug('Msg Responses:', tx.msgResponses);
      } catch (decodeErr) {
        console.debug('Msg Responses (undecoded):', response.msgResponses, decodeErr);
      }
    }
    if (response.events) {
      console.debug('Events:', response.events);
    }

    if (response.code !== 0) {
      this.inFlight = null;
      this.#handleBroadcastFailure(tx, new Error(`Broadcast rejected: code ${response.code}`));
      return;
    }

    tx.status = TX_STATUS.SUCCEEDED;
    tx.error = null;
    if (tx.requiresCharge) {
      // Anchor convention: chain inclusion height when present, else
      // broadcastAtBlock + 1 (matches the old optimistic client convention).
      const anchor = (typeof response.height === 'number' && response.height > 0)
        ? response.height
        : tx.broadcastAtBlock + 1;
      this.scheduleAnchorHeight = Math.max(this.scheduleAnchorHeight, anchor);
      this.clampScheduleAnchor();
    }
    this.inFlight = null;
    this.settle(tx);
    this.persist();
  }

  /**
   * Apply the retry policy after a failure: re-queue at tail if attempts remain,
   * otherwise drop and settle. Never mutates KeyPlayer (grass-only lastAction).
   *
   * @param {SigningTransaction} tx
   * @param {Error} err
   */
  #handleBroadcastFailure(tx, err) {
    console.warn('Sign and Broadcast Error:', err);
    tx.attempts++;
    tx.error = String(err);
    if (this.canRetry(tx)) {
      this.appendToLane(tx);
    } else {
      tx.status = TX_STATUS.DROPPED;
      this.settle(tx);
      this.persist();
    }
  }

  /**
   * Poll the chain for a tx hash for up to TIMEOUT_POLL_BLOCKS block ticks.
   * `inFlight` stays set during the poll (still one logical broadcast).
   *
   * @param {string} txId
   * @return {Promise<object|null>} the indexed tx, or null if not found in time
   */
  async pollForTx(txId) {
    for (let i = 0; i < TIMEOUT_POLL_BLOCKS; i++) {
      try {
        const found = await this.gameState.signingClient.getTx(txId);
        if (found) {
          return found;
        }
      } catch (err) {
        console.debug('[SigningQueueManager] pollForTx error (will retry):', err);
      }
      await this.#waitForNextBlock();
    }
    try {
      return await this.gameState.signingClient.getTx(txId);
    } catch {
      return null;
    }
  }

  /**
   * Resolve on the next BLOCK_HEIGHT_CHANGED (with a time-based safety net so we
   * never hang if blocks stall).
   *
   * @return {Promise<void>}
   */
  #waitForNextBlock() {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        window.removeEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, finish);
        resolve();
      };
      window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, finish);
      setTimeout(finish, Math.max(DEFAULT_BLOCK_TIME_MS, this.getAvgBlockMs()) * 2);
    });
  }

  /**
   * @param {SigningTransaction} tx
   * @return {boolean}
   */
  canRetry(tx) {
    if (tx.retryLimit === -1) {
      return true;
    }
    return tx.attempts < 1 + tx.retryLimit;
  }

  /**
   * Restore a held/shifted transaction to the head of its lane (preserves order
   * for the signer-match hold path).
   *
   * @param {SigningTransaction} tx
   */
  #restoreToLaneHead(tx) {
    tx.status = TX_STATUS.QUEUED;
    const lane = tx.requiresCharge ? this.chargeQueue : this.immediateQueue;
    lane.unshift(tx);
    this.persist();
  }

  // ---------------------------------------------------------------------------
  // Settlement (Promise + event, no callbacks)
  // ---------------------------------------------------------------------------

  /**
   * Resolve any waiting whenSettled Promise and dispatch the settled event.
   * Only ever called from a terminal branch in broadcast / load.
   *
   * @param {SigningTransaction} tx
   */
  settle(tx) {
    const waiter = this.settlementWaiters.get(tx.id);
    if (waiter) {
      this.settlementWaiters.delete(tx.id);
      waiter.resolve(tx);
    }
    window.dispatchEvent(new SigningTransactionSettledEvent(
      tx.id,
      tx.status,
      tx.accountAddress,
      tx.response,
      tx.error
    ));
  }

  /**
   * Promise that resolves (never rejects) with the transaction when it reaches a
   * terminal state. Callers MUST check `tx.status`. Already-terminal txs resolve
   * immediately; unknown ids resolve with a synthetic terminal record so callers
   * never hang.
   *
   * @param {string} id
   * @return {Promise<SigningTransaction|object>}
   */
  whenSettled(id) {
    const existing = this.getTransaction(id);
    if (existing && existing.isTerminal()) {
      return Promise.resolve(existing);
    }
    if (!existing) {
      // No such live tx (e.g. settled before the caller awaited, or rehydrated
      // without a waiter). Resolve so .then()/await never hangs.
      return Promise.resolve({id, status: TX_STATUS.DROPPED, response: null, error: 'unknown transaction'});
    }
    return new Promise((resolve) => {
      this.settlementWaiters.set(id, {resolve});
    });
  }

  // ---------------------------------------------------------------------------
  // Mutation API (internal — no player UI yet)
  // ---------------------------------------------------------------------------

  /**
   * Remove a queued transaction from either lane and settle it as cancelled.
   * Refuses if the tx is currently in flight.
   *
   * @param {string} id
   * @return {boolean}
   */
  cancelQueueItem(id) {
    if (this.inFlight && this.inFlight.id === id) {
      return false;
    }
    for (const lane of [this.immediateQueue, this.chargeQueue]) {
      const index = lane.findIndex((tx) => tx.id === id);
      if (index !== -1) {
        const [tx] = lane.splice(index, 1);
        tx.status = TX_STATUS.CANCELLED;
        this.persist();
        this.settle(tx);
        return true;
      }
    }
    return false;
  }

  /**
   * Move a charge-lane item to a new index. Refuses for in-flight or unknown ids.
   *
   * @param {string} id
   * @param {number} newIndex
   * @return {boolean}
   */
  reorderChargeQueue(id, newIndex) {
    if (this.inFlight && this.inFlight.id === id) {
      return false;
    }
    const index = this.chargeQueue.findIndex((tx) => tx.id === id);
    if (index === -1) {
      return false;
    }
    const clamped = Math.max(0, Math.min(newIndex, this.chargeQueue.length - 1));
    const [tx] = this.chargeQueue.splice(index, 1);
    this.chargeQueue.splice(clamped, 0, tx);
    this.persist();
    return true;
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveChargeItemUp(id) {
    const index = this.chargeQueue.findIndex((tx) => tx.id === id);
    if (index <= 0) {
      return false;
    }
    return this.reorderChargeQueue(id, index - 1);
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveChargeItemDown(id) {
    const index = this.chargeQueue.findIndex((tx) => tx.id === id);
    if (index === -1 || index >= this.chargeQueue.length - 1) {
      return false;
    }
    return this.reorderChargeQueue(id, index + 1);
  }

  /**
   * @param {string} id
   * @return {SigningTransaction|null}
   */
  getTransaction(id) {
    if (this.inFlight && this.inFlight.id === id) {
      return this.inFlight;
    }
    return this.immediateQueue.find((tx) => tx.id === id)
      ?? this.chargeQueue.find((tx) => tx.id === id)
      ?? null;
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  /**
   * Per-account, per-chain storage key. Returns null until the signing account
   * is known (Review hardening #1) so we never read/write a global queue.
   *
   * @return {string|null}
   */
  getStorageKey() {
    const address = this.gameState.signingAccount?.address;
    if (!address || !this.wsUrl) {
      return null;
    }
    return `${SigningQueueManager.STORAGE_KEY_PREFIX}:${this.wsUrl}:${address}`;
  }

  /**
   * Write the full snapshot synchronously (matches the gameState save pattern).
   * No-op until the storage key is resolvable.
   */
  persist() {
    const storageKey = this.getStorageKey();
    if (!storageKey) {
      return;
    }
    const snapshot = {
      version: SigningQueueManager.STORAGE_VERSION,
      savedAt: Date.now(),
      savedAtBlock: this.gameState.currentBlockHeight,
      scheduleAnchorHeight: this.scheduleAnchorHeight,
      lastBroadcastHeight: this.lastBroadcastHeight,
      immediateQueue: this.immediateQueue.map((tx) => tx.toJSON()),
      chargeQueue: this.chargeQueue.map((tx) => tx.toJSON()),
      inFlight: this.inFlight ? this.inFlight.toJSON() : null,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch (err) {
      console.error('[SigningQueueManager] persist failed:', err);
    }
  }

  /**
   * Rehydrate from localStorage. Called once the signing account is available
   * (from SigningClientManager.initSigningClient). Defensive: never throws,
   * worst case starts empty. Stale snapshots are quarantined, not replayed.
   */
  loadPersistedState() {
    if (this.rehydrated) {
      return;
    }
    const storageKey = this.getStorageKey();
    if (!storageKey) {
      console.warn('[SigningQueueManager] cannot rehydrate: no signing account/endpoint yet.');
      return;
    }
    this.rehydrated = true;

    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch (err) {
      console.error('[SigningQueueManager] localStorage read failed:', err);
      return;
    }
    if (!raw) {
      return;
    }

    let state;
    try {
      state = JSON.parse(raw);
    } catch (err) {
      console.error('[SigningQueueManager] corrupt persisted queue, quarantining:', err);
      this.#quarantine(storageKey, raw);
      return;
    }

    // Review hardening #2: stale-queue guard (applies before version check).
    if (typeof state.savedAt === 'number'
      && Date.now() - state.savedAt > SigningQueueManager.MAX_QUEUE_AGE_MS) {
      console.warn('[SigningQueueManager] persisted queue is stale; quarantining, starting empty.');
      this.#quarantine(storageKey, raw);
      return;
    }

    if (state.version !== SigningQueueManager.STORAGE_VERSION) {
      console.warn(
        `[SigningQueueManager] queue version mismatch (have ${state.version}, want ${SigningQueueManager.STORAGE_VERSION}); starting empty.`
      );
      return;
    }

    try {
      this.scheduleAnchorHeight = typeof state.scheduleAnchorHeight === 'number' ? state.scheduleAnchorHeight : 0;
      this.lastBroadcastHeight = typeof state.lastBroadcastHeight === 'number' ? state.lastBroadcastHeight : 0;

      this.immediateQueue = this.#rehydrateLane(state.immediateQueue);
      this.chargeQueue = this.#rehydrateLane(state.chargeQueue);

      if (state.inFlight) {
        const tx = SigningTransaction.fromJSON(state.inFlight);
        if (tx) {
          // We cannot know if it landed on-chain before unload. Conservative:
          // re-queue at tail with attempts++ (same as a failure retry).
          tx.attempts = (tx.attempts ?? 0) + 1;
          if (this.canRetry(tx)) {
            this.appendToLane(tx);
          } else {
            tx.status = TX_STATUS.DROPPED;
            this.settle(tx);
          }
        }
      }
      console.info('[SigningQueueManager] queue rehydrated.');
      this.persist();
    } catch (err) {
      console.error('[SigningQueueManager] rehydrate failed, starting empty:', err);
      this.immediateQueue = [];
      this.chargeQueue = [];
      this.inFlight = null;
    }
  }

  /**
   * Rebuild a lane from persisted JSON, dropping corrupt entries and any whose
   * typeUrl is no longer in the registry.
   *
   * @param {Array<object>} rawLane
   * @return {SigningTransaction[]}
   */
  #rehydrateLane(rawLane) {
    if (!Array.isArray(rawLane)) {
      return [];
    }
    const lane = [];
    for (const json of rawLane) {
      const tx = SigningTransaction.fromJSON(json);
      if (!tx) {
        console.warn('[SigningQueueManager] dropping corrupt persisted tx:', json);
        continue;
      }
      if (!this.registry.lookupType(tx.message.typeUrl)) {
        console.warn('[SigningQueueManager] dropping tx with unknown typeUrl:', tx.message.typeUrl);
        continue;
      }
      // A persisted in_flight in a lane never happened; normalize to queued.
      if (tx.status === TX_STATUS.IN_FLIGHT) {
        tx.status = TX_STATUS.QUEUED;
      }
      lane.push(tx);
    }
    return lane;
  }

  /**
   * @param {string} storageKey
   * @param {string} raw
   */
  #quarantine(storageKey, raw) {
    try {
      localStorage.setItem(`${storageKey}.corrupt`, raw);
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('[SigningQueueManager] quarantine failed:', err);
    }
  }
}
