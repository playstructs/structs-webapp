import {deviceChangeIntent} from "../util/DeviceChangeIntent";
import {EVENTS} from "../constants/Events";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {SIGNING_QUEUE} from "../constants/SigningQueueConstants";
import {TASK} from "../constants/TaskConstants";
import {SigningTransaction, TX_STATUS} from "../models/SigningTransaction";
import {SigningTransactionSettledEvent} from "../events/SigningTransactionSettledEvent";
import {normalizeMessagePayload} from "../util/MessagePayload";
import {TransactionJournal} from "./TransactionJournal";
import {SigningDeferredError} from "./SigningSubmission";
import {transferIntent} from "../util/TransferIntent";
import {reactorIntent} from "../util/ReactorIntent";
import {registrationIntent} from "../util/RegistrationIntent";
import {generatorIntent} from "../util/GeneratorIntent";
import {gameplayIntent} from "../util/GameplayIntent";
import {workSubmissionMatches} from "../util/WorkSubmission";

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
 * Owns the transaction queue: two lanes (immediate FIFO + ordered action lane),
 * lazy charge gating, persistence, broadcast loop, and settlement.
 *
 * SigningClientManager builds plain payloads and delegates here; this class is
 * the single authority for *when and how* a transaction is sent. It never
 * writes KeyPlayer last-action state and schedules off
 * KeyPlayer.confirmedLastActionBlockHeight (GRASS/chain confirmed), ignoring the
 * optimistically-drained display `lastActionBlockHeight`. An internal
 * `scheduleAnchorHeight` bridges the 1-2 block GRASS lag and is clamped
 * opportunistically once GRASS catches up.
 */
export class SigningQueueManager {

  /**
   * @param {GameState} gameState
   * @param {object} deps
   * @param {import('@cosmjs/proto-signing').Registry} deps.registry
   * @param {string} deps.wsUrl - Endpoint, used to scope the storage key per chain.
   */
  constructor(gameState, {registry, wsUrl, submission = null}) {
    this.gameState = gameState;
    this.registry = registry;
    this.wsUrl = wsUrl;
    this.submission = submission;
    this.unresolved = new Map();
    this.completed = new Map();
    this.working = false;
    this.idleWaiters = new Set();
    this.recoveryError = null;
    this.storageScope = null;
    this.suspended = false;

    /** @type {SigningTransaction[]} Unordered lane; fired ASAP. */
    this.immediateQueue = [];
    /** @type {SigningTransaction[]} Ordered action lane; head gated lazily on charge. */
    this.actionQueue = [];
    /** @type {SigningTransaction|null} Tx currently being broadcast. */
    this.inFlight = null;
    /** @type {number} Shared per-block broadcast governor (one tx/block/address). */
    this.lastBroadcastHeight = 0;
    /** @type {number} Bridges GRASS lag between successful charge broadcasts. */
    this.scheduleAnchorHeight = 0;
    /** @type {Map<string, Set<function>>} In-memory only; backs whenSettled. */
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

  enqueueGameplayImmediate(typeUrl, payload, options = {}) {
    return this.#enqueue(typeUrl,payload,false,null,options,this.#gameplayIntent(typeUrl,payload));
  }

  enqueueGameplayAction(typeUrl, payload, chargeCost, options = {}) {
    return this.#enqueue(typeUrl,payload,true,chargeCost,options,this.#gameplayIntent(typeUrl,payload));
  }

  #gameplayIntent(typeUrl, payload) {
    assertSerializable(payload);
    return gameplayIntent({kind:'gameplay',version:1,
      ownerId:this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER]?.id,typeUrl,payload});
  }

  /** Persist user intent without freezing protocol-specific transaction bytes. */
  enqueueTransfer(value) {
    return this.#enqueueIntent(transferIntent(value));
  }

  enqueueReactor(value) {
    return this.#enqueueIntent(reactorIntent(value));
  }

  enqueueGenerator(value) {
    return this.#enqueueIntent(generatorIntent(value));
  }

  findRegistration(ownerId, address) {
    return this.#findIntent(tx=>tx?.intent?.kind === 'address_register' && tx.intent.ownerId === ownerId && tx.intent.address === address);
  }

  findPendingDeviceChange(ownerId, address) {
    return this.#findIntent(tx=>tx?.intent?.kind === 'device_change' && tx.intent.ownerId === ownerId && tx.intent.address === address && !tx.isTerminal());
  }

  findWorkSubmission(state) {
    return this.#findIntent(tx=>workSubmissionMatches(tx,state,this.registry),true);
  }

  enqueueDeviceChange(value) {
    return this.#enqueueIntent(deviceChangeIntent(value));
  }

  #findIntent(matches, successFirst = false) {
    this.loadPersistedState();
    if (this.recoveryError) throw new Error('Saved signing evidence requires recovery');
    this.#bindScope();
    // Adopt another tab's durable result before returning an observer's ID. While
    // a send is running, its in-memory object remains owned by the send loop.
    if (!this.working) this.#mergeJournal(new TransactionJournal(this.gameState.signingAccount.address),false);
    const candidates=[...this.immediateQueue,...this.actionQueue,...this.unresolved.values(),...this.completed.values(),
      ...(this.inFlight ? [this.inFlight] : [])];
    return candidates.filter(matches)
      .sort((a,b)=>(successFirst ? Number(b.status === TX_STATUS.SUCCEEDED)-Number(a.status === TX_STATUS.SUCCEEDED) : 0)
        || Number(a.isTerminal())-Number(b.isTerminal()) || b.createdAt-a.createdAt || b.id.localeCompare(a.id))[0] ?? null;
  }

  enqueueRegistration(value) {
    return this.#enqueueIntent(registrationIntent(value));
  }

  #enqueueIntent(intent) {
    this.#assertCanEnqueue();
    const tx = SigningTransaction.create({intent,isAction:false,chargeCost:null,retryLimit:0,
      accountAddress:this.gameState.signingAccount.address,enqueuedAtBlock:this.gameState.currentBlockHeight});
    this.appendToLane(tx);
    return tx.id;
  }

  /**
   * Enqueue an ordered action-lane transaction. A `chargeCost` of 0 means the
   * action is free but still broadcast in order; only `chargeCost > 0` items
   * advance the schedule anchor (reset the on-chain charge bar).
   *
   * @param {string} typeUrl
   * @param {object} payload - Plain JSON object, no `creator`.
   * @param {number} chargeCost - Charge gate; 0 = ordered but free.
   * @param {object} [options]
   * @return {string} transaction id
   */
  enqueueAction(typeUrl, payload, chargeCost, options = {}) {
    return this.#enqueue(typeUrl, payload, true, chargeCost, options);
  }

  /**
   * @param {string} typeUrl
   * @param {object} payload
   * @param {boolean} isAction
   * @param {number|null} chargeCost
   * @param {object} options
   * @return {string}
   */
  #enqueue(typeUrl, payload, isAction, chargeCost, options, intent = null) {
    assertSerializable(payload);
    payload = normalizeMessagePayload(typeUrl, payload);

    this.#assertCanEnqueue();
    // Retained in the saved format; signed submissions are never auto-retried.
    const retryLimit = typeof options.retryLimit === 'number'
      ? options.retryLimit
      : SIGNING_QUEUE.DEFAULT_RETRY_LIMIT;

    const tx = SigningTransaction.create({
      typeUrl,
      payload,
      isAction,
      chargeCost,
      retryLimit,
      accountAddress: this.gameState.signingAccount?.address ?? null,
      enqueuedAtBlock: this.gameState.currentBlockHeight,
      intentProtocol: options.intentProtocol ?? null,
      intent,
    });

    this.appendToLane(tx);
    return tx.id;
  }

  #assertCanEnqueue() {
    this.#bindScope();
    if (this.suspended || this.recoveryError || this.unresolved.size || new TransactionJournal(this.gameState.signingAccount.address)
        .read().some(record=>['broadcasting','accepted','unknown'].includes(record.phase))) {
      throw new SigningDeferredError('Resolve the existing submission before adding another intent');
    }
  }

  /**
   * Push a demonstrably unsent intent onto its lane and persist.
   *
   * @param {SigningTransaction} tx
   */
  appendToLane(tx) {
    tx.status = TX_STATUS.QUEUED;
    tx.error = tx.error ?? null;
    const lane = tx.isAction ? this.actionQueue : this.immediateQueue;
    lane.push(tx);
    if (!this.persist()) {
      lane.pop();
      throw new Error('Unsent intent could not be persisted');
    }
  }

  // ---------------------------------------------------------------------------
  // Scheduling (lazy — no stored schedule)
  // ---------------------------------------------------------------------------

  /**
   * GRASS/chain-confirmed last action for the PLAYER (never raid key players).
   * Reads the confirmed field, NOT the display `lastActionBlockHeight`, which
   * may be optimistically drained by the UI when a charge action is queued.
   *
   * @return {number}
   */
  getGrassLastAction() {
    const player = this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER];
    return player ? player.confirmedLastActionBlockHeight : 0;
  }

  /**
   * Whether the PLAYER's confirmed last-action height has been loaded from the
   * API/GRASS yet. The action lane is held until this is true so charge actions
   * are never scheduled against the default (0) base before it is known.
   *
   * @return {boolean}
   */
  isConfirmedActionLoaded() {
    const player = this.gameState.keyPlayers?.[PLAYER_TYPES.PLAYER];
    return !!player && player.confirmedLastActionLoaded === true;
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
    if (this.blockTimestamps.length > SIGNING_QUEUE.BLOCK_TIME_SAMPLE_SIZE) {
      this.blockTimestamps.shift();
    }
  }

  /**
   * @return {number} average ms between blocks (falls back to default with <2 samples)
   */
  getAvgBlockMs() {
    const t = this.blockTimestamps;
    if (t.length < 2) {
      return TASK.ESTIMATED_BLOCK_TIME;
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
    return this.actionQueue.map((tx) => {
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

  /** At most one new send per block/account; unresolved work only reconciles. */
  async transactOnBlock(reconcileOnly = false) {
    if (this.suspended || this.working || !this.gameState.signingClient || !this.gameState.signingAccount?.address || !this.submission) return;
    this.working = true;
    try {
      this.#bindScope();
      const journal = new TransactionJournal(this.gameState.signingAccount.address);
      await journal.exclusive(async () => {
        if (this.suspended) return;
        this.#mergeJournal(journal);
        if (this.unresolved.size) {
          // Bounded work on each block. Unknown legacy records never become retries.
          const pending = [...this.unresolved.values()];
          for (const tx of pending.slice(0, 4)) {
            if (!tx.submission) {
              this.unresolved.delete(tx.id); this.unresolved.set(tx.id,tx);
              continue;
            }
            try {
              const response = tx.response?.stage==='committed' || (tx.response?.stage==='check_tx' && tx.response.code>0)
                ? tx.response : await this.#deadline(this.submission.find(tx),SIGNING_QUEUE.RECONCILE_TIMEOUT_MS);
              if (response) this.#finish(tx,response,journal);
            } catch (error) { tx.error = String(error); }
            // Rotate so a temporarily unavailable hash cannot starve other records.
            if (this.unresolved.has(tx.id)) { this.unresolved.delete(tx.id); this.unresolved.set(tx.id,tx); }
          }
          return;
        }
        if (reconcileOnly || this.recoveryError) return;
        const height = this.gameState.currentBlockHeight;
        if (this.lastBroadcastHeight >= height) return;
        const head = this.actionQueue[0];
        const lane = head && this.isConfirmedActionLoaded() && this.projectedChargeAt(height)>=head.chargeCost
          ? this.actionQueue : this.immediateQueue;
        const tx = lane.shift();
        if (tx) await this.#broadcast(tx,journal);
      });
    } catch (error) {
      console.warn('[SigningQueueManager] signing/recovery unavailable:',error);
    } finally {
      this.working = false;
      for (const resolve of this.idleWaiters) resolve();
      this.idleWaiters.clear();
    }
  }

  /** Detach an account only after its current send has saved its outcome. */
  async releaseAccount() {
    this.suspended = true;
    if (this.working) await new Promise(resolve=>this.idleWaiters.add(resolve));
    // The caller still owns the old wallet here. Never move its evidence into
    // another account's queue or erase a malformed snapshot while switching.
    if (this.storageScope && !this.recoveryError && !this.persist()) {
      throw new Error('Signing account queue could not be saved');
    }
    for (const waiters of this.settlementWaiters.values()) {
      for (const waiter of [...waiters]) waiter.cancel(new Error('Signing account changed'));
    }
    this.settlementWaiters.clear();
    this.immediateQueue = [];
    this.actionQueue = [];
    this.inFlight = null;
    this.unresolved.clear();
    this.completed.clear();
    this.lastBroadcastHeight = 0;
    this.scheduleAnchorHeight = 0;
    this.recoveryError = null;
    this.storageScope = null;
    this.rehydrated = false;
  }

  /** Existing resume timer may recover results even when GRASS has missed blocks. */
  reconcilePending() {
    return this.transactOnBlock(true);
  }

  hasUnresolvedSubmissions() {
    return this.unresolved.size>0;
  }

  async #broadcast(tx, journal) {
    if (tx.accountAddress!==this.gameState.signingAccount.address) {
      this.#restoreToLaneHead(tx);
      return;
    }
    if (tx.createdAt>Date.now() || Date.now()-tx.createdAt>SIGNING_QUEUE.MAX_QUEUE_AGE_MS || TransactionJournal.isSessionClosed(tx)) {
      try { this.#finish(tx,null,journal,'Unsent intent expired'); }
      catch (error) { this.#restoreToLaneHead(tx); throw error; }
      return;
    }
    tx.status = TX_STATUS.PREPARING;
    this.inFlight = tx;
    this.persist();
    let active = true;
    let sending = false;
    try {
      tx.submission = await this.#deadline(this.submission.prepare(tx,()=>{
        if (!active || this.suspended || TransactionJournal.isSessionClosed(tx)) throw new Error('Signing preparation expired or session closed');
      }),SIGNING_QUEUE.BROADCAST_TIMEOUT_MS);
      // Both writes are synchronous under the account lock. No network call is
      // reachable until exact bytes/hash and then the send marker are durable.
      journal.write(tx,'prepared');
      tx.status = TX_STATUS.UNKNOWN;
      tx.broadcastAtBlock = this.gameState.currentBlockHeight;
      journal.write(tx,'broadcasting');
      sending = true;
      this.unresolved.set(tx.id,tx);
      this.lastBroadcastHeight = this.gameState.currentBlockHeight;
      this.persist();
      const response = await this.#deadline(this.submission.send(tx),SIGNING_QUEUE.RECONCILE_TIMEOUT_MS);
      if (response.code!==0) {
        this.#finish(tx,response,journal);
        return;
      }
      // CheckTx acceptance is not a terminal success.
      tx.response = response;
      journal.write(tx,'accepted');
      const committed = await this.#deadline(this.submission.find(tx),SIGNING_QUEUE.RECONCILE_TIMEOUT_MS);
      if (committed) this.#finish(tx,committed,journal);
    } catch (error) {
      tx.error = String(error);
      if (sending) {
        tx.status = TX_STATUS.UNKNOWN;
        this.unresolved.set(tx.id,tx);
        // The durable broadcasting/accepted record already protects this intent.
        // A failed later write must not erase that evidence or settle as failure.
        try { journal.write(tx,'unknown'); } catch (persistError) { console.warn('[SigningQueueManager] outcome persistence unavailable:',persistError); }
      } else if (error instanceof SigningDeferredError) {
        tx.submission = null;
        this.#restoreToLaneHead(tx);
      } else {
        try { this.#finish(tx,null,journal,String(error)); }
        catch {
          tx.submission = null;
          this.#restoreToLaneHead(tx);
        }
      }
    } finally {
      active = false;
      this.inFlight = null;
      this.persist();
    }
  }

  #deadline(operation, milliseconds) {
    let timer;
    const deadline = new Promise((resolve,reject)=>{
      timer = setTimeout(()=>reject(new Error('Transaction operation timed out')),milliseconds);
    });
    return Promise.race([operation,deadline]).finally(()=>clearTimeout(timer));
  }

  #finish(tx, response, journal, error = null) {
    const {msgResponses, ...savedResponse} = response ?? {};
    tx.response = response ? savedResponse : null;
    tx.status = response?.stage==='committed' && response.code===0 ? TX_STATUS.SUCCEEDED : TX_STATUS.DROPPED;
    tx.error = error ?? (tx.status===TX_STATUS.SUCCEEDED ? null : `Transaction rejected: ${response?.code ?? 'not submitted'}`);
    try { journal.write(tx,'settled'); }
    catch (failure) { tx.status = TX_STATUS.UNKNOWN; throw failure; }
    this.unresolved.delete(tx.id);
    this.#removeFromLanes(tx.id);
    this.#rememberCompleted(tx);
    if (Array.isArray(response?.msgResponses)) {
      try { tx.msgResponses = response.msgResponses.map(message=>({typeUrl:message.typeUrl,value:this.registry.decode(message)})); }
      catch (decodeError) { console.debug('[SigningQueueManager] response decoding unavailable:',decodeError); }
    }
    this.persist();
    this.settle(tx);
  }

  #rememberCompleted(tx) {
    this.completed.set(tx.id,tx);
    if (tx.status===TX_STATUS.SUCCEEDED && tx.chargeCost>0 && tx.response?.stage==='committed') {
      const height = Number(tx.response.height);
      if (Number.isSafeInteger(height) && height>0) this.scheduleAnchorHeight = Math.max(this.scheduleAnchorHeight,height);
      this.clampScheduleAnchor();
    }
  }

  #removeFromLanes(id) {
    this.immediateQueue = this.immediateQueue.filter(tx=>tx.id!==id);
    this.actionQueue = this.actionQueue.filter(tx=>tx.id!==id);
  }

  #mergeJournal(journal, persistLegacy = true) {
    const records = journal.read();
    const ids = new Set();
    for (const record of records) {
      const tx = SigningTransaction.fromJSON(record.transaction);
      if (!tx || tx.accountAddress!==journal.accountAddress) throw new Error('Invalid journal transaction; recovery required');
      ids.add(tx.id);
      const known = this.getTransaction(tx.id);
      if (Number.isSafeInteger(tx.broadcastAtBlock)) this.lastBroadcastHeight = Math.max(this.lastBroadcastHeight,tx.broadcastAtBlock);
      this.#removeFromLanes(tx.id);
      if (record.phase==='settled') {
        const notify = known && !known.isTerminal();
        this.unresolved.delete(tx.id);
        this.#rememberCompleted(tx);
        if (notify) this.settle(tx);
      } else if (record.phase==='prepared') {
        // New code could not transmit without first replacing this record with
        // broadcasting. Rebuild only this demonstrably unsent intent.
        tx.submission = null;
        tx.status = TX_STATUS.QUEUED;
        this.unresolved.delete(tx.id);
        (tx.isAction ? this.actionQueue : this.immediateQueue).unshift(tx);
      } else {
        tx.status = TX_STATUS.UNKNOWN;
        if (known?.submission?.hash===tx.submission?.hash && (known?.response?.stage==='committed'
            || (known?.response?.stage==='check_tx' && known.response.code>0))) tx.response = known.response;
        this.unresolved.set(tx.id,tx);
      }
    }
    for (const tx of this.unresolved.values()) {
      if (persistLegacy && !ids.has(tx.id)) journal.write(tx,'unknown');
    }
  }

  #restoreToLaneHead(tx) {
    tx.status = TX_STATUS.QUEUED;
    const lane = tx.isAction ? this.actionQueue : this.immediateQueue;
    lane.unshift(tx);
    this.persist();
  }

  #bindScope() {
    const key = this.getStorageKey();
    if (!key) throw new Error('Signing account is unavailable');
    if (this.storageScope && this.storageScope!==key) throw new Error('Signing account changed; reload its queue before submitting');
    this.storageScope = key;
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
      for (const resolve of waiter) resolve(tx);
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
   * Promise that resolves with the transaction when it reaches a
   * terminal state. Callers MUST check `tx.status`. Already-terminal txs resolve
   * immediately. Missing/ambiguous evidence never becomes a fabricated failure;
   * a waiter remains pending until a terminal result is established.
   * An optional signal rejects only this observer on abort; the transaction continues.
   *
   * @param {string} id
   * @param {AbortSignal} [signal]
   * @return {Promise<SigningTransaction|object>}
   */
  whenSettled(id, signal = undefined) {
    if (signal?.aborted) return Promise.reject(signal.reason);
    const existing = this.getTransaction(id);
    if (existing && existing.isTerminal()) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve, reject) => {
      const waiters = this.settlementWaiters.get(id) ?? new Set();
      const settled = tx => {
        signal?.removeEventListener('abort', abort);
        resolve(tx);
      };
      const cancel = reason => {
        waiters.delete(settled);
        if (!waiters.size) this.settlementWaiters.delete(id);
        signal?.removeEventListener('abort', abort);
        reject(reason);
      };
      const abort = () => cancel(signal.reason);
      settled.cancel = cancel;
      waiters.add(settled);
      this.settlementWaiters.set(id,waiters);
      signal?.addEventListener('abort', abort, {once: true});
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
   * @return {Promise<boolean>}
   */
  async cancelQueueItem(id) {
    if (this.working) return false;
    this.#bindScope();
    const journal = new TransactionJournal(this.gameState.signingAccount.address);
    return journal.exclusive(async () => {
      this.#mergeJournal(journal);
      if (this.unresolved.has(id) || this.inFlight?.id===id) return false;
      const tx = this.immediateQueue.find(tx=>tx.id===id) ?? this.actionQueue.find(tx=>tx.id===id);
      if (!tx) return false;
      tx.status = TX_STATUS.CANCELLED;
      try { journal.write(tx,'settled'); }
      catch (error) { tx.status = TX_STATUS.QUEUED; throw error; }
      this.#removeFromLanes(id);
      this.#rememberCompleted(tx);
      this.persist();
      this.settle(tx);
      return true;
    });
  }

  /**
   * Move an action-lane item to a new index. Refuses for in-flight or unknown ids.
   *
   * @param {string} id
   * @param {number} newIndex
   * @return {boolean}
   */
  reorderActionQueue(id, newIndex) {
    if (this.inFlight && this.inFlight.id === id) {
      return false;
    }
    const index = this.actionQueue.findIndex((tx) => tx.id === id);
    if (index === -1) {
      return false;
    }
    const clamped = Math.max(0, Math.min(newIndex, this.actionQueue.length - 1));
    const [tx] = this.actionQueue.splice(index, 1);
    this.actionQueue.splice(clamped, 0, tx);
    this.persist();
    return true;
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveActionItemUp(id) {
    const index = this.actionQueue.findIndex((tx) => tx.id === id);
    if (index <= 0) {
      return false;
    }
    return this.reorderActionQueue(id, index - 1);
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveActionItemDown(id) {
    const index = this.actionQueue.findIndex((tx) => tx.id === id);
    if (index === -1 || index >= this.actionQueue.length - 1) {
      return false;
    }
    return this.reorderActionQueue(id, index + 1);
  }

  /**
   * Whether either lane still holds work. Excludes `inFlight`, so a listener
   * reacting to a settlement sees only the transactions behind the one that
   * just finished.
   *
   * @return {boolean}
   */
  hasQueuedTransactions() {
    return this.immediateQueue.length > 0 || this.actionQueue.length > 0;
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
      ?? this.actionQueue.find((tx) => tx.id === id)
      ?? this.unresolved.get(id)
      ?? this.completed.get(id)
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
    return `${SIGNING_QUEUE.STORAGE_KEY_PREFIX}:${this.wsUrl}:${address}`;
  }

  /**
   * Write the full snapshot synchronously (matches the gameState save pattern).
   * No-op until the storage key is resolvable.
   */
  persist() {
    const storageKey = this.getStorageKey();
    if (!storageKey || this.recoveryError || (this.storageScope && storageKey!==this.storageScope)) {
      return false;
    }
    const snapshot = {
      version: SIGNING_QUEUE.STORAGE_VERSION,
      savedAt: Date.now(),
      savedAtBlock: this.gameState.currentBlockHeight,
      scheduleAnchorHeight: this.scheduleAnchorHeight,
      lastBroadcastHeight: this.lastBroadcastHeight,
      immediateQueue: this.immediateQueue.map((tx) => tx.toJSON()),
      actionQueue: this.actionQueue.map((tx) => tx.toJSON()),
      inFlight: this.inFlight ? this.inFlight.toJSON() : null,
      unresolved: [...this.unresolved.values()].map(tx=>tx.toJSON()),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      return true;
    } catch (err) {
      console.error('[SigningQueueManager] persist failed:', err);
      return false;
    }
  }

  /** Restore unsent work; preserve ambiguous evidence regardless of age/schema. */
  loadPersistedState() {
    if (this.rehydrated) return;
    try {
      this.#bindScope();
      const raw = localStorage.getItem(this.storageScope);
      if (raw) {
        const state = JSON.parse(raw);
        if (!state || ![2,SIGNING_QUEUE.STORAGE_VERSION].includes(state.version)
            || !Array.isArray(state.immediateQueue) || !Array.isArray(state.actionQueue)) {
          throw new Error('Unrecognized saved queue; recovery required');
        }
        this.scheduleAnchorHeight = Number.isSafeInteger(state.scheduleAnchorHeight) ? state.scheduleAnchorHeight : 0;
        this.lastBroadcastHeight = Number.isSafeInteger(state.lastBroadcastHeight) ? state.lastBroadcastHeight : 0;
        const seen = new Set();
        // Ambiguous evidence outranks a duplicate unsigned lane entry.
        const records = [...(state.unresolved ?? []),...(state.inFlight ? [state.inFlight] : []),...state.immediateQueue,...state.actionQueue];
        for (const json of records) {
          const tx = SigningTransaction.fromJSON(json);
          if (!tx || tx.accountAddress!==this.gameState.signingAccount.address) throw new Error('Invalid saved intent; recovery required');
          if (seen.has(tx.id)) continue;
          seen.add(tx.id);
          if (tx.isTerminal()) { this.#rememberCompleted(tx); continue; }
          const unknown = tx.submission || [TX_STATUS.IN_FLIGHT,TX_STATUS.UNKNOWN].includes(tx.status)
            || (json===state.inFlight && !(state.version===3 && tx.status===TX_STATUS.PREPARING));
          if (unknown) {
            tx.status = TX_STATUS.UNKNOWN;
            this.unresolved.set(tx.id,tx);
          } else if (![TX_STATUS.QUEUED,TX_STATUS.PREPARING].includes(tx.status)) {
            throw new Error('Unknown intent state; recovery required');
          } else if (Date.now()-tx.createdAt>SIGNING_QUEUE.MAX_QUEUE_AGE_MS || (!tx.intent && !this.registry.lookupType(tx.message.typeUrl))) {
            tx.status = TX_STATUS.DROPPED;
            tx.error = 'Unsent intent is expired or unsupported';
            this.#rememberCompleted(tx);
          } else {
            tx.status = TX_STATUS.QUEUED;
            (tx.isAction ? this.actionQueue : this.immediateQueue).push(tx);
          }
        }
      }
      this.#mergeJournal(new TransactionJournal(this.gameState.signingAccount.address),false);
      this.rehydrated = true;
      this.persist();
    } catch (error) {
      // Keep the original queue/journal untouched. Starting empty here could
      // make a previously broadcast payment look safe to replace.
      this.recoveryError = String(error);
      console.error('[SigningQueueManager] saved evidence needs recovery:',error);
    }
  }
}
