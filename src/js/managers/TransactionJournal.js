import {CHAIN} from "../constants/ChainConstants";
import {SIGNING_QUEUE} from "../constants/SigningQueueConstants";

/** One record per intent: a queue snapshot can never erase a signed submission. */
export class TransactionJournal {
  static SESSION_CLOSED_KEY = 'signingSessionClosedAt';

  static isSessionClosed(tx) {
    const value = localStorage.getItem(this.SESSION_CLOSED_KEY);
    if (value===null) return false;
    const time = Number(value);
    if (!Number.isSafeInteger(time) || time<0) throw new Error('Invalid signing session boundary');
    return tx.createdAt<=time;
  }

  /** Remove wallet/session data without erasing public submission evidence. */
  static clearSession() {
    const keys = Array.from({length:localStorage.length},(_,i)=>localStorage.key(i));
    for (const key of keys) {
      if (key && !key.startsWith('signingJournal:') && !key.startsWith(`${SIGNING_QUEUE.STORAGE_KEY_PREFIX}:`)
          && key!==this.SESSION_CLOSED_KEY) localStorage.removeItem(key);
    }
    // Preserved unsigned queue entries cannot resume after an explicit logout.
    localStorage.setItem(this.SESSION_CLOSED_KEY,String(Date.now()));
  }

  constructor(accountAddress) {
    if (!accountAddress) throw new Error('Transaction journal requires a signer');
    this.accountAddress = accountAddress;
    this.prefix = `signingJournal:${CHAIN.ID}:${accountAddress}:`;
  }

  read() {
    const records = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.prefix)) continue;
      const raw = localStorage.getItem(key);
      if (raw===null) continue; // Another tab may have pruned terminal history.
      const record = JSON.parse(raw);
      if (record?.version !== 1 || record.accountAddress !== this.accountAddress
          || record.chainId !== CHAIN.ID || typeof record.transaction?.id !== 'string'
          || record.transaction.accountAddress !== this.accountAddress
          || key !== this.prefix + record.transaction.id
          || !['prepared','broadcasting','accepted','unknown','settled'].includes(record.phase)
          || (record.phase==='prepared' && (record.transaction.status!=='preparing' || !record.transaction.submission))
          || (['broadcasting','accepted','unknown'].includes(record.phase) && record.transaction.status!=='unknown')
          || (record.phase==='settled' && !['succeeded','dropped','cancelled'].includes(record.transaction.status))) {
        throw new Error('Unrecognized transaction journal; recovery required');
      }
      records.push(record);
    }
    return records;
  }

  write(tx, phase) {
    if (tx.accountAddress !== this.accountAddress) throw new Error('Transaction journal signer mismatch');
    // Only terminal history is bounded. Unresolved records never expire.
    const completed = this.read().filter(record=>record.phase==='settled' && record.transaction.id!==tx.id)
      .sort((a,b)=>b.updatedAt-a.updatedAt);
    for (const record of completed.slice(99)) {
      // An old tab can still hold an unsigned queue entry. Retain its terminal
      // tombstone for at least as long as that intent is permitted to run.
      if (Date.now()-record.updatedAt>SIGNING_QUEUE.MAX_QUEUE_AGE_MS) localStorage.removeItem(this.prefix+record.transaction.id);
    }
    const record = {version:1,chainId:CHAIN.ID,accountAddress:this.accountAddress,
      phase,updatedAt:Date.now(),transaction:tx.toJSON()};
    const encoded = JSON.stringify(record);
    const key = this.prefix+tx.id;
    localStorage.setItem(key,encoded);
    if (localStorage.getItem(key)!==encoded) throw new Error('Signed transaction could not be persisted');
  }

  async exclusive(run) {
    if (!globalThis.navigator?.locks?.request) throw new Error('Exclusive signing storage is unavailable');
    return navigator.locks.request(`structs-signing:${CHAIN.ID}:${this.accountAddress}`,
      {mode:'exclusive',ifAvailable:true}, lock=>lock ? run() : false);
  }
}
