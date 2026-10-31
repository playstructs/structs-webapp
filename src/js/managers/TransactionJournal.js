import {CHAIN} from "../constants/ChainConstants";
import {SIGNING_QUEUE} from "../constants/SigningQueueConstants";
import {isHistoricalSubmission} from "../util/SubmissionHistory";

/**
 * One record per intent: a queue snapshot can never erase a signed submission.
 */
export class TransactionJournal {
  static SESSION_CLOSED_KEY = 'signingSessionClosedAt';

  /**
   * @param {SigningTransaction} tx
   * @return {boolean} whether the transaction was created before the last logout
   */
  static isSessionClosed(tx) {
    const value = localStorage.getItem(this.SESSION_CLOSED_KEY);
    if (value === null) return false;
    const time = Number(value);
    if (!Number.isSafeInteger(time) || time < 0) throw new Error('Invalid signing session boundary');
    return tx.createdAt <= time;
  }

  /**
   * Remove wallet/session data without erasing public submission evidence.
   */
  static clearSession() {
    // Publish the boundary before removing private state, so an old tab's
    // synchronous save cannot repopulate it while this tab clears storage.
    const previous = Number(localStorage.getItem(this.SESSION_CLOSED_KEY));
    const boundary = Number.isSafeInteger(previous) && previous >= 0 && previous < Number.MAX_SAFE_INTEGER
      ? Math.max(Date.now(), previous + 1)
      : Date.now();
    let boundaryWritten = false;
    try {
      localStorage.setItem(this.SESSION_CLOSED_KEY, String(boundary));
      boundaryWritten = true;
    } catch {
      /* A full store may need private records removed before adding the marker. */
    }
    const keys = Array.from({length: localStorage.length}, (_, i) => localStorage.key(i));
    for (const key of keys) {
      if (
        key
        && !key.startsWith('signingJournal:')
        && !key.startsWith(`${SIGNING_QUEUE.STORAGE_KEY_PREFIX}:`)
        && key !== this.SESSION_CLOSED_KEY
      ) {
        localStorage.removeItem(key);
      }
    }
    if (!boundaryWritten) localStorage.setItem(this.SESSION_CLOSED_KEY, String(boundary));
  }

  /**
   * @param {string} accountAddress
   */
  constructor(accountAddress) {
    if (!accountAddress) throw new Error('Transaction journal requires a signer');
    this.accountAddress = accountAddress;
    this.prefix = `signingJournal:${CHAIN.ID}:${accountAddress}:`;
  }

  /**
   * @return {object[]} every journal record for this signer
   */
  read() {
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.prefix)) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue; // Another tab may have pruned terminal history.
      records.push(this.#parse(key, raw));
    }
    return records;
  }

  /**
   * @param {string} key
   * @param {string} raw
   * @return {object}
   */
  #parse(key, raw) {
    const record = JSON.parse(raw);
    if (
      record?.version !== 1
      || record.accountAddress !== this.accountAddress
      || record.chainId !== CHAIN.ID
      || typeof record.transaction?.id !== 'string'
      || record.transaction.accountAddress !== this.accountAddress
      || key !== this.prefix + record.transaction.id
      || !['prepared', 'broadcasting', 'accepted', 'unknown', 'historical', 'settled'].includes(record.phase)
      || (record.phase === 'prepared' && (record.transaction.status !== 'preparing' || !record.transaction.submission))
      || (['broadcasting', 'accepted', 'unknown'].includes(record.phase) && record.transaction.status !== 'unknown')
      || (record.phase === 'historical' && !isHistoricalSubmission(record.transaction))
      || (record.phase === 'settled' && !['succeeded', 'dropped', 'cancelled'].includes(record.transaction.status))
    ) {
      throw new Error('Unrecognized transaction journal; recovery required');
    }
    return record;
  }

  /**
   * Moves aside, unchanged, every journal and device-action record this
   * version cannot read. Signing then resumes without them.
   *
   * @return {number} records moved
   */
  quarantine() {
    let moved = 0;
    const devicePrefix = `deviceChange:${CHAIN.ID}:${this.accountAddress}:`;
    const keys = Array.from({length: localStorage.length}, (_, i) => localStorage.key(i));
    for (const key of keys) {
      const raw = key === null ? null : localStorage.getItem(key);
      if (raw === null || (!key.startsWith(this.prefix) && !key.startsWith(devicePrefix))) continue;
      try {
        if (key.startsWith(this.prefix)) {
          this.#parse(key, raw);
        } else if (typeof JSON.parse(raw)?.id !== 'string') {
          throw new Error('Invalid saved device action');
        }
        continue;
      } catch {
        /* Unreadable: set aside below. */
      }
      TransactionJournal.quarantineKey(this.accountAddress, key);
      moved++;
    }
    return moved;
  }

  /**
   * Quarantined records keep the journal prefix, so logout preserves them as evidence.
   *
   * @param {string} accountAddress
   * @param {string} key
   */
  static quarantineKey(accountAddress, key) {
    const raw = localStorage.getItem(key);
    const target = `signingJournal:quarantine:${CHAIN.ID}:${accountAddress}:${Date.now()}:${key}`;
    localStorage.setItem(target, raw);
    if (localStorage.getItem(target) !== raw) throw new Error('Saved signing record could not be set aside');
    localStorage.removeItem(key);
  }

  /**
   * @param {SigningTransaction} tx
   * @param {string} phase
   */
  write(tx, phase) {
    if (tx.accountAddress !== this.accountAddress) throw new Error('Transaction journal signer mismatch');
    const referenced = this.deviceActionReferences();
    // Only terminal history is bounded. Unresolved records never expire.
    const completed = this.read()
      .filter(record => record.phase === 'settled' && record.transaction.id !== tx.id)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    for (const record of completed.slice(99)) {
      // An old tab can still hold an unsigned queue entry. Retain its terminal
      // tombstone for at least as long as that intent is permitted to run.
      if (
        !referenced.has(record.transaction.id)
        && Date.now() - record.updatedAt > SIGNING_QUEUE.MAX_QUEUE_AGE_MS
      ) {
        localStorage.removeItem(this.prefix + record.transaction.id);
      }
    }
    const record = {
      version: 1,
      chainId: CHAIN.ID,
      accountAddress: this.accountAddress,
      phase,
      updatedAt: Date.now(),
      transaction: tx.toJSON(),
    };
    const encoded = JSON.stringify(record);
    const key = this.prefix + tx.id;
    localStorage.setItem(key, encoded);
    if (localStorage.getItem(key) !== encoded) throw new Error('Signed transaction could not be persisted');
  }

  /**
   * A device observer may resume after terminal history would normally expire.
   *
   * @return {Set<string>} transaction ids referenced by saved device actions
   */
  deviceActionReferences() {
    const prefix = `deviceChange:${CHAIN.ID}:${this.accountAddress}:`;
    const referenced = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const value = localStorage.getItem(key);
      if (value === null) continue;
      const saved = JSON.parse(value);
      if (typeof saved?.id !== 'string') throw new Error('Invalid saved device action');
      referenced.add(saved.id);
    }
    return referenced;
  }

  /**
   * Run while holding this signer's cross-tab lock; resolves false if another tab holds it.
   *
   * @param {function(): Promise<*>} run
   * @return {Promise<*>}
   */
  async exclusive(run) {
    if (!globalThis.navigator?.locks?.request) throw new Error('Exclusive signing storage is unavailable');
    return navigator.locks.request(
      `structs-signing:${CHAIN.ID}:${this.accountAddress}`,
      {mode: 'exclusive', ifAvailable: true},
      lock => lock ? run() : false
    );
  }
}
