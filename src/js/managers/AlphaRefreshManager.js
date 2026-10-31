import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";
import {CHAIN} from "../constants/ChainConstants";
import {TX_STATUS} from "../models/SigningTransaction";
import {exactQueryHeight, maxQueryHeight} from "../util/ChainProtocol";

/**
 * One cancellable, coalesced read stream for the signed-in player's funds.
 */
export class AlphaRefreshManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {{coalesceMs?: number, retryMs?: number, maxRetryMs?: number, pollMs?: number}} options
   */
  constructor(gameState, guildAPI, {coalesceMs = 100, retryMs = 2000, maxRetryMs = 30000, pollMs = 30000} = {}) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.coalesceMs = coalesceMs;
    this.retryMs = retryMs;
    this.maxRetryMs = maxRetryMs;
    this.pollMs = pollMs;
    this.session = null;
  }

  /**
   * Start a session for the current player and signing account, replacing any
   * previous one.
   */
  start() {
    this.stop();
    const keyPlayer = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
    const account = this.gameState.signingAccount?.address;
    if (this.gameState.persistenceEnabled === false || !keyPlayer.id || !account) {
      return;
    }
    const session = {
      keyPlayer,
      ownerId: keyPlayer.id,
      account,
      controller: new AbortController(),
      timer: null,
      poll: null,
      running: false,
      dirty: false,
      revision: 0,
      height: null,
      retry: this.retryMs,
    };
    this.session = session;
    const options = {signal: session.controller.signal};
    const refresh = () => this.request();
    for (const name of ['focus', 'pageshow', 'online', EVENTS.GRASS_CONNECTED]) {
      window.addEventListener(name, refresh, options);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    }, options);
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, () => {
      if (!this.current(session)) return;
      const snapshot = keyPlayer.alphaSnapshot;
      keyPlayer.expireFunds(this.gameState.currentBlockHeight);
      if (snapshot && !keyPlayer.alphaSnapshot) this.request();
    }, options);
    window.addEventListener(EVENTS.SIGNING_TRANSACTION_SETTLED, event => {
      if (
        event.accountAddress === account
        && event.status === TX_STATUS.SUCCEEDED
        && event.response?.stage === 'committed'
        && event.response.code === 0
        && event.response.chainId === CHAIN.ID
      ) {
        this.request(event.response.height);
      }
    }, options);
    session.poll = setInterval(refresh, this.pollMs);
    this.request();
  }

  stop() {
    const session = this.session;
    this.session = null;
    if (!session) return;
    session.controller.abort();
    clearTimeout(session.timer);
    clearInterval(session.poll);
  }

  /**
   * Whether the session still belongs to the signed-in player and account.
   * A session that no longer does is stopped.
   *
   * @param {object} session
   * @return {boolean}
   */
  current(session) {
    const active = this.session === session
      && !session.controller.signal.aborted
      && this.gameState.persistenceEnabled !== false
      && session.account === this.gameState.signingAccount?.address
      && session.keyPlayer === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
      && session.ownerId === session.keyPlayer.id;
    if (!active && this.session === session) this.stop();
    return active;
  }

  /**
   * Ask for a refresh, optionally no older than the given height.
   *
   * @param {string|number|null} height
   */
  request(height = null) {
    const session = this.session;
    if (!session || !this.current(session)) return;
    // Notifications only raise a read boundary; their amounts are never used.
    for (const value of [height, this.gameState.currentBlockHeight]) {
      if (value === null || value === undefined || value === 0) continue;
      try {
        session.height = session.height ? maxQueryHeight(session.height, value) : exactQueryHeight(value);
      } catch {
        /* A malformed invalidation is still a reason to fetch. */
      }
    }
    if (session.height) session.keyPlayer.expireFunds(session.height);
    session.revision++;
    session.dirty = true;
    this.schedule(session, this.coalesceMs);
  }

  /**
   * @param {object} session
   * @param {number} delay
   */
  schedule(session, delay) {
    if (
      !this.current(session)
      || document.visibilityState === 'hidden'
      || session.running
      || session.timer !== null
    ) {
      return;
    }
    session.timer = setTimeout(() => {
      session.timer = null;
      this.refresh(session).catch(error => console.warn('[AlphaRefresh] refresh failed:', error));
    }, delay);
  }

  /**
   * @param {object} session
   */
  async refresh(session) {
    if (!this.current(session) || document.visibilityState === 'hidden') return;
    session.running = true;
    const revision = session.revision;
    let delay = this.coalesceMs;
    try {
      const player = await this.guildAPI.getPlayer(session.ownerId, {signal: session.controller.signal, timeoutMs: 16000});
      if (!this.current(session)) return;
      const height = exactQueryHeight(player.snapshot_meta?.height);
      if (session.height && BigInt(height) < BigInt(session.height)) {
        throw new Error('Funds have not reached the requested block');
      }
      if (!session.keyPlayer.setFunds(player, session.height)) {
        throw new Error('Funds snapshot is unavailable or older');
      }
      session.dirty = revision !== session.revision;
      session.retry = this.retryMs;
    } catch (error) {
      if (!this.current(session)) return;
      session.dirty = true;
      delay = session.retry;
      session.retry = Math.min(session.retry * 2, this.maxRetryMs);
      console.debug('[AlphaRefresh] funds unavailable:', error);
    } finally {
      session.running = false;
      if (session.dirty && this.current(session)) this.schedule(session, delay);
    }
  }
}
