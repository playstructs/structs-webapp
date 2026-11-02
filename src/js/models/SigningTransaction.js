import {UuidUtil} from "../util/UuidUtil";
import {messagePayloadToWire} from "../util/MessagePayload";
import {transactionIntent} from "../util/TransactionIntent";
import {REACTOR_TRANSACTION} from "../constants/ReactorTransactions";
import {MAX_ALPHA_SOURCES} from "../util/AvailableAlpha";

/**
 * Lifecycle states for a queued signing transaction.
 *
 * Preparing is demonstrably unsent in the current saved format. Legacy
 * in_flight and unknown records require reconciliation and never auto-retry.
 *
 * @readonly
 * @enum {string}
 */
export const TX_STATUS = {
  QUEUED: 'queued',
  PREPARING: 'preparing',
  IN_FLIGHT: 'in_flight',
  UNKNOWN: 'unknown',
  SUCCEEDED: 'succeeded',
  DROPPED: 'dropped',
  CANCELLED: 'cancelled',
};

/**
 * Terminal states — once a transaction reaches one of these it never moves again.
 *
 * @type {string[]}
 */
const TERMINAL_STATUSES = [TX_STATUS.SUCCEEDED, TX_STATUS.DROPPED, TX_STATUS.CANCELLED];

/**
 * Fields persisted to localStorage via {@link SigningTransaction#toJSON}. The
 * in-memory-only `msgResponses` snapshot is intentionally excluded (it can be
 * large and is rebuildable from chain), and there are no function fields to
 * strip (callbacks were removed in favour of the Promise + event model).
 *
 * @type {string[]}
 */
const PERSISTED_FIELDS = [
  'id',
  'message',
  'messages',
  'accountAddress',
  'isAction',
  'chargeCost',
  'status',
  'createdAt',
  'enqueuedAtBlock',
  'broadcastAtBlock',
  'attempts',
  'retryLimit',
  'response',
  'error',
  'submission',
  'intentProtocol',
  'intent',
];

/**
 * A single queued transaction tracked by SigningQueueManager.
 *
 * The cosmos message is stored as `{ typeUrl, payload }` where `payload` is a
 * plain, JSON-serializable object WITHOUT `creator`. The signing address is
 * injected at broadcast time from {@link SigningTransaction#accountAddress} so a
 * wallet switch mid-queue can never sign with the wrong key.
 */
export class SigningTransaction {
  /**
   * @param {object} fields - Pre-validated field bag (see {@link SigningTransaction.create} / {@link SigningTransaction.fromJSON}).
   */
  constructor(fields) {
    /** @type {string} */
    this.id = fields.id;
    /** @type {{ typeUrl: string, payload: object }} */
    this.message = fields.message;
    /** @type {Array<{ typeUrl: string, payload: object }>|null} An atomic message group, when set. */
    this.messages = fields.messages ?? null;
    /** @type {string} Owning signer address; persisted; used as `creator` at broadcast. */
    this.accountAddress = fields.accountAddress;
    /** @type {boolean} True when this tx belongs to the ordered action lane. */
    this.isAction = fields.isAction;
    /** @type {number|null} Charge gate for action-lane txs; 0 = ordered but free. */
    this.chargeCost = fields.chargeCost;
    /** @type {string} See {@link TX_STATUS}. */
    this.status = fields.status;
    /** @type {number} */
    this.createdAt = fields.createdAt;
    /** @type {number|null} */
    this.enqueuedAtBlock = fields.enqueuedAtBlock;
    /** @type {number|null} */
    this.broadcastAtBlock = fields.broadcastAtBlock;
    /** @type {number} */
    this.attempts = fields.attempts;
    /** @type {number} Legacy saved field; signed submissions never auto-retry. */
    this.retryLimit = fields.retryLimit;
    /** @type {object|null} Serializable snapshot of the broadcast response. */
    this.response = fields.response;
    /** @type {string|null} */
    this.error = fields.error;
    /** @type {Array<object>|null} In-memory only; never persisted. */
    this.msgResponses = fields.msgResponses ?? null;
    /** @type {object|null} The signed bytes and their signing context. */
    this.submission = fields.submission ?? null;
    /** @type {string|null} Protocol the messages were prepared for. */
    this.intentProtocol = fields.intentProtocol ?? null;
    /** @type {object|null} What the user consented to; messages are prepared from it. */
    this.intent = fields.intent ?? null;
  }

  /**
   * Build a fresh transaction for enqueue.
   *
   * @param {object} args
   * @param {string} args.typeUrl
   * @param {object} args.payload - Plain JSON object, no `creator`.
   * @param {boolean} args.isAction - True for the ordered action lane.
   * @param {number|null} args.chargeCost - Charge gate; 0 = ordered but free.
   * @param {number} args.retryLimit
   * @param {string} args.accountAddress
   * @param {number} args.enqueuedAtBlock
   * @return {SigningTransaction}
   */
  static create({
    typeUrl,
    payload,
    isAction,
    chargeCost,
    retryLimit,
    accountAddress,
    enqueuedAtBlock,
    intentProtocol = null,
    intent = null,
  }) {
    return new SigningTransaction({
      id: UuidUtil.generate(),
      message: intent ? null : { typeUrl, payload },
      accountAddress,
      isAction: !!isAction,
      chargeCost: isAction ? chargeCost : null,
      status: TX_STATUS.QUEUED,
      createdAt: Date.now(),
      enqueuedAtBlock,
      broadcastAtBlock: null,
      attempts: 0,
      retryLimit,
      response: null,
      error: null,
      msgResponses: null,
      intentProtocol,
      intent: intent ? transactionIntent(intent) : null,
    });
  }

  /**
   * Encode to a cosmjs-ready message. `creator` is injected here (broadcast
   * time) from {@link SigningTransaction#accountAddress}, never stored in the
   * persisted payload.
   *
   * @param {import('@cosmjs/proto-signing').Registry} registry
   * @return {{ typeUrl: string, value: object }}
   */
  toCosmosMsg(registry) {
    if (this.messages) throw new Error('Atomic message groups must be encoded together');
    return this.encodeMessage(registry, this.message);
  }

  /**
   * Encode every message, checking an atomic group has the shape its intent allows.
   *
   * @param {Registry} registry
   * @return {Array<{ typeUrl: string, value: object }>}
   */
  toCosmosMsgs(registry) {
    if (!this.messages) return [this.toCosmosMsg(registry)];
    if (!Array.isArray(this.messages) || !this.messages.length) {
      throw new Error('Invalid atomic message group');
    }
    if (this.intent?.kind === 'reactor_change' && this.intent.direction === 'defuse') {
      if (
        this.messages.length > REACTOR_TRANSACTION.MAX_POSITIONS
        || this.messages.some(message => message.typeUrl !== '/structs.structs.MsgReactorDefuse')
      ) {
        throw new Error('Invalid atomic reactor withdrawal');
      }
    } else {
      let finalType = null;
      if (this.intent?.kind === 'alpha_transfer') {
        finalType = this.intent.recipientId === null
          ? '/structs.structs.MsgPlayerSend'
          : '/structs.structs.MsgVaultSend';
      } else if (this.intent?.kind === 'reactor_change' && this.intent.direction === 'infuse') {
        finalType = '/structs.structs.MsgReactorInfuse';
      } else if (this.intent?.kind === 'generator_fund') {
        finalType = '/structs.structs.MsgStructGeneratorInfuse';
      }
      const last = this.messages.length - 1;
      if (
        !finalType
        || last > MAX_ALPHA_SOURCES
        || this.messages[last].typeUrl !== finalType
        || this.messages.slice(0, last).some(message => message.typeUrl !== '/structs.structs.MsgPlayerSend')
      ) {
        throw new Error('Invalid atomic funding group');
      }
    }
    return this.messages.map(message => this.encodeMessage(registry, message));
  }

  /**
   * @param {Registry} registry
   * @param {{ typeUrl: string, payload: object }} message
   * @return {{ typeUrl: string, value: object }}
   */
  encodeMessage(registry, message) {
    const type = registry.lookupType(message.typeUrl);
    if (!type) {
      throw new Error(`Unknown typeUrl in registry: ${message.typeUrl}`);
    }
    return {
      typeUrl: message.typeUrl,
      value: type.fromPartial({ ...messagePayloadToWire(message.typeUrl, message.payload), creator: this.accountAddress }),
    };
  }

  /**
   * @return {boolean}
   */
  isTerminal() {
    return TERMINAL_STATUSES.includes(this.status);
  }

  /**
   * Serializable snapshot — allowlisted fields only. Omits in-memory-only
   * `msgResponses`.
   *
   * @return {object}
   */
  toJSON() {
    const out = {};
    for (const field of PERSISTED_FIELDS) {
      out[field] = this[field];
    }
    return out;
  }

  /**
   * Rebuild from a persisted snapshot. Returns null if the object is missing
   * the structural fields needed for recovery (caller preserves the original store).
   *
   * @param {object} obj
   * @return {SigningTransaction|null}
   */
  static fromJSON(obj) {
    let intent = null;
    if (obj?.intent !== undefined && obj.intent !== null) {
      try {
        intent = transactionIntent(obj.intent);
      } catch {
        return null;
      }
    }
    if (
      !obj
      || typeof obj !== 'object'
      || typeof obj.id !== 'string'
      || obj.id.length === 0
      || !Number.isSafeInteger(obj.createdAt)
      || obj.createdAt < 0
      || (
        !intent
        && (
          !obj.message
          || typeof obj.message.typeUrl !== 'string'
          || typeof obj.message.payload !== 'object'
          || obj.message.payload === null
        )
      )
    ) {
      return null;
    }

    return new SigningTransaction({
      id: obj.id,
      message: obj.message ? { typeUrl: obj.message.typeUrl, payload: obj.message.payload } : null,
      messages: obj.messages ?? null,
      accountAddress: typeof obj.accountAddress === 'string' ? obj.accountAddress : null,
      isAction: !!obj.isAction,
      chargeCost: typeof obj.chargeCost === 'number' ? obj.chargeCost : null,
      status: typeof obj.status === 'string' ? obj.status : TX_STATUS.QUEUED,
      createdAt: obj.createdAt,
      enqueuedAtBlock: typeof obj.enqueuedAtBlock === 'number' ? obj.enqueuedAtBlock : null,
      broadcastAtBlock: typeof obj.broadcastAtBlock === 'number' ? obj.broadcastAtBlock : null,
      attempts: typeof obj.attempts === 'number' ? obj.attempts : 0,
      retryLimit: typeof obj.retryLimit === 'number' ? obj.retryLimit : 0,
      response: obj.response ?? null,
      error: typeof obj.error === 'string' ? obj.error : null,
      msgResponses: null,
      submission: obj.submission ?? null,
      intentProtocol: obj.intentProtocol ?? null,
      intent,
    });
  }
}
