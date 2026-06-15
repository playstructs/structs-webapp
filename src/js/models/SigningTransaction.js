import {UuidUtil} from "../util/UuidUtil";

/**
 * Lifecycle states for a queued signing transaction.
 *
 * Retryable failures do NOT get a persistent `failed` status — they return to
 * `queued` (with `attempts` / `error` set) until they either `succeeded` or are
 * `dropped` (no retries left).
 *
 * @readonly
 * @enum {string}
 */
export const TX_STATUS = {
  QUEUED: 'queued',
  IN_FLIGHT: 'in_flight',
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
  'accountAddress',
  'requiresCharge',
  'chargeCost',
  'status',
  'createdAt',
  'enqueuedAtBlock',
  'broadcastAtBlock',
  'attempts',
  'retryLimit',
  'response',
  'error',
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
    /** @type {string} Owning signer address; persisted; used as `creator` at broadcast. */
    this.accountAddress = fields.accountAddress;
    /** @type {boolean} */
    this.requiresCharge = fields.requiresCharge;
    /** @type {number|null} */
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
    /** @type {number} Per-tx retry policy: -1 infinite, 0 one-shot, n>0 up to 1+n attempts. */
    this.retryLimit = fields.retryLimit;
    /** @type {object|null} Serializable snapshot of the broadcast response. */
    this.response = fields.response;
    /** @type {string|null} */
    this.error = fields.error;
    /** @type {Array<object>|null} In-memory only; never persisted. */
    this.msgResponses = fields.msgResponses ?? null;
  }

  /**
   * Build a fresh transaction for enqueue.
   *
   * @param {object} args
   * @param {string} args.typeUrl
   * @param {object} args.payload - Plain JSON object, no `creator`.
   * @param {boolean} args.requiresCharge
   * @param {number|null} args.chargeCost
   * @param {number} args.retryLimit
   * @param {string} args.accountAddress
   * @param {number} args.enqueuedAtBlock
   * @return {SigningTransaction}
   */
  static create({ typeUrl, payload, requiresCharge, chargeCost, retryLimit, accountAddress, enqueuedAtBlock }) {
    return new SigningTransaction({
      id: UuidUtil.generate(),
      message: { typeUrl, payload },
      accountAddress,
      requiresCharge: !!requiresCharge,
      chargeCost: requiresCharge ? chargeCost : null,
      status: TX_STATUS.QUEUED,
      createdAt: Date.now(),
      enqueuedAtBlock,
      broadcastAtBlock: null,
      attempts: 0,
      retryLimit,
      response: null,
      error: null,
      msgResponses: null,
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
    const type = registry.lookupType(this.message.typeUrl);
    if (!type) {
      throw new Error(`Unknown typeUrl in registry: ${this.message.typeUrl}`);
    }
    return {
      typeUrl: this.message.typeUrl,
      value: type.fromPartial({ ...this.message.payload, creator: this.accountAddress }),
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
   * the structural fields needed to ever broadcast (caller quarantines).
   *
   * @param {object} obj
   * @return {SigningTransaction|null}
   */
  static fromJSON(obj) {
    if (
      !obj
      || typeof obj !== 'object'
      || typeof obj.id !== 'string'
      || !obj.message
      || typeof obj.message.typeUrl !== 'string'
      || typeof obj.message.payload !== 'object'
      || obj.message.payload === null
    ) {
      return null;
    }

    return new SigningTransaction({
      id: obj.id,
      message: { typeUrl: obj.message.typeUrl, payload: obj.message.payload },
      accountAddress: typeof obj.accountAddress === 'string' ? obj.accountAddress : null,
      requiresCharge: !!obj.requiresCharge,
      chargeCost: typeof obj.chargeCost === 'number' ? obj.chargeCost : null,
      status: typeof obj.status === 'string' ? obj.status : TX_STATUS.QUEUED,
      createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
      enqueuedAtBlock: typeof obj.enqueuedAtBlock === 'number' ? obj.enqueuedAtBlock : null,
      broadcastAtBlock: typeof obj.broadcastAtBlock === 'number' ? obj.broadcastAtBlock : null,
      attempts: typeof obj.attempts === 'number' ? obj.attempts : 0,
      retryLimit: typeof obj.retryLimit === 'number' ? obj.retryLimit : 0,
      response: obj.response ?? null,
      error: typeof obj.error === 'string' ? obj.error : null,
      msgResponses: null,
    });
  }
}
