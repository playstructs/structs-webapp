import {TransactionJournal} from "./TransactionJournal";
import {CHAIN} from "../constants/ChainConstants";
import {transferAddress} from "../util/TransferIntent";

const RECOVERY_TTL_MS = 60 * 60 * 1000;

/** Private device keys share the existing wallet's local storage/logout boundary. */
export class DeviceRegistrationStore {
  static key(mode, guildId, playerId, source) {
    if (!['recovery','activation'].includes(mode) || !/^0-[1-9][0-9]*$/.test(guildId)
        || !/^1-[1-9][0-9]*$/.test(playerId)) throw new Error('Invalid device registration scope');
    if (mode === 'recovery') transferAddress(source);
    else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(source)) {
      throw new Error('Invalid activation instance');
    }
    return `deviceRegistration:${CHAIN.ID}:${mode}:${guildId}:${playerId}:${source}`;
  }

  constructor(mode, guildId, playerId, source) {
    this.sessionBoundary = localStorage.getItem(TransactionJournal.SESSION_CLOSED_KEY);
    this.scope = {mode,guildId,playerId,source};
    this.key = DeviceRegistrationStore.key(mode,guildId,playerId,source);
  }

  assertCurrentSession() {
    if (this.sessionBoundary !== localStorage.getItem(TransactionJournal.SESSION_CLOSED_KEY)) {
      throw new Error('Device registration session was closed');
    }
  }

  read() {
    this.assertCurrentSession();
    const raw = localStorage.getItem(this.key);
    if (raw === null) return null;
    const record = JSON.parse(raw);
    if (record?.version !== 1 || record.chainId !== CHAIN.ID || typeof record.mnemonic !== 'string'
        || !record.mnemonic || Object.keys(this.scope).some(key=>record[key] !== this.scope[key])) {
      throw new Error('Saved device registration requires recovery');
    }
    transferAddress(record.address);
    if (typeof record.pubkey !== 'string' || !/^(02|03)[0-9a-f]{64}$/.test(record.pubkey)) {
      throw new Error('Saved device key identity is invalid');
    }
    return record;
  }

  write(value) {
    const previous = this.read();
    if (previous && ['mnemonic','address','pubkey'].some(key=>previous[key] !== value[key])) {
      throw new Error('An existing device identity cannot be replaced');
    }
    const record = {...value,...this.scope,version:1,chainId:CHAIN.ID,createdAt:previous?.createdAt ?? Date.now()};
    const encoded = JSON.stringify(record);
    localStorage.setItem(this.key,encoded);
    if (localStorage.getItem(this.key) !== encoded) throw new Error('Device key could not be persisted');
    return this.read();
  }

  async exclusive(action) {
    if (!globalThis.navigator?.locks?.request) throw new Error('Exclusive device storage is unavailable');
    return navigator.locks.request(this.key,{mode:'exclusive',ifAvailable:true},lock=>{
      if (!lock) throw new Error('Device registration is already being prepared');
      this.assertCurrentSession();
      return action();
    });
  }

  markActive() {
    this.assertCurrentSession();
    localStorage.setItem(`deviceRegistrationActive:${CHAIN.ID}:${this.scope.guildId}`,this.key);
  }

  static active(guildId) {
    const key=localStorage.getItem(`deviceRegistrationActive:${CHAIN.ID}:${guildId}`);
    if (!key) return null;
    const raw=localStorage.getItem(key);
    if (!raw) throw new Error('Active device registration is missing');
    const record=JSON.parse(raw);
    const store=new DeviceRegistrationStore(record.mode,record.guildId,record.playerId,record.source);
    if (store.key !== key || record.guildId !== guildId || record.mode !== 'activation') throw new Error('Invalid active device scope');
    return {store,record:store.read()};
  }

  /**
   * Removes device keys left by abandoned account recoveries. Only someone
   * repeating the recovery resumes one, so after an hour the unused key is a
   * liability on a shared browser, even when its registration committed.
   *
   * @param {number} now
   */
  static async expireRecovery(now = Date.now()) {
    if (!globalThis.navigator?.locks?.request) return;
    const prefix = `deviceRegistration:${CHAIN.ID}:recovery:`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) {
      await navigator.locks.request(key,{mode:'exclusive',ifAvailable:true},lock=>{
        if (!lock) return; // Another tab is running this recovery.
        let createdAt = null;
        try { createdAt = JSON.parse(localStorage.getItem(key))?.createdAt; } catch { /* Unreadable records expire. */ }
        if (!Number.isSafeInteger(createdAt) || createdAt > now || now - createdAt > RECOVERY_TTL_MS) localStorage.removeItem(key);
      });
    }
  }

  complete() {
    this.clearActive();
    localStorage.removeItem(this.key);
  }

  clearActive() {
    this.assertCurrentSession();
    const key=`deviceRegistrationActive:${CHAIN.ID}:${this.scope.guildId}`;
    if (localStorage.getItem(key) === this.key) localStorage.removeItem(key);
  }
}
