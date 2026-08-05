import * as natsCore from "@nats-io/nats-core";
import {LOG_LEVEL, STALE_BLOCK_MS} from "../constants/GrassConstants";

/**
 * Guild Rapid Alert System Stream
 *
 * Self-healing NATS-over-WebSocket subscriber. The connection handle and the
 * active subscription are kept on the instance so the stream can be torn down
 * and re-established on demand (resume-check / watchdog) and automatically after
 * an unexpected close, instead of throwing an unhandled GrassError.
 */
export class GrassManager {

  /**
   * @param {string} grassServerUrl
   * @param {string} subject
   * @param {GameState} gameState
   * @param {string} logLevel
   */
  constructor(grassServerUrl, subject, gameState, logLevel = LOG_LEVEL.NONE) {
    this.grassServerUrl = grassServerUrl;
    this.subject = subject;
    this.listeners = new Map();
    this.gameState = gameState;
    this.logLevel = logLevel;

    // Connection lifecycle state
    this.nc = null;
    this.subscription = null;
    this.running = false;       // true between init()/reconnect() and close()
    this.supervising = false;   // guards against overlapping supervise loops
    this.backoffMs = 1000;      // grows to backoffMax on repeated failures
    this.backoffMax = 30000;
    this.lastForcedReconnectAt = 0;
  }

  /**
   * @param {MsgImpl} message
   * @return {object}
   */
  getMessageData(message) {
    return message.json();
  }

  /**
   * @param {object} messageData
   * @return {boolean}
   */
  shouldIgnoreMessage(messageData) {
    return !messageData.hasOwnProperty('subject')
      || !messageData.hasOwnProperty('category');
  }

  /**
   * @param {AbstractGrassListener} listener
   */
  registerListener(listener) {
    this.listeners.set(listener.name, listener);
  }

  /**
   * @param {string} name
   */
  unregisterListener(name) {
    this.listeners.delete(name);
  }

  /**
   * @param {object} messageData
   */
  logMessageData(messageData) {
    if (this.logLevel === LOG_LEVEL.NONE) {
      return;
    }

    if (this.logLevel === LOG_LEVEL.ALL) {
      console.log(messageData);
    }

    if (
      this.logLevel === LOG_LEVEL.KEY_PLAYER
      && Object.values(this.gameState.keyPlayers).reduce((isRelevant, keyPlayer) =>
        isRelevant || (!!keyPlayer.id && new RegExp(`(^|\\.)${keyPlayer.id}(\\.|$)`).test(messageData.subject))
      , false)
    ) {
      console.log(messageData);
    }
  }

  /**
   * Start the stream. Idempotent: a second call while already running is a no-op.
   */
  init() {
    if (this.running) return;
    this.running = true;
    this.backoffMs = 1000;

    // Kick off the supervised loop without leaving a floating promise. If it
    // ever rejects (defensive — every await inside it is already guarded),
    // reset to a clean stopped state so a later init() can restart it.
    this._supervise().catch((e) => {
      console.warn('[GrassManager] supervise loop crashed:', this.subject, e);
      this.running = false;
      this.supervising = false;
    });
  }

  /**
   * Tear the current connection down. The supervised loop treats this like any
   * other unexpected close: it backs off briefly, reconnects and re-subscribes,
   * keeping every registered listener.
   */
  reconnect() {
    if (!this.running) {
      this.init();
      return;
    }

    // Nothing to tear down means the loop is already between attempts. Leaving
    // it alone matters during a real outage: resetting the backoff on every
    // check would turn a steady retry into a burst of them.
    if (!this.nc) {
      return;
    }

    console.warn('[GrassManager] forcing reconnect:', this.subject);
    this.lastForcedReconnectAt = Date.now();

    // The connection we are dropping looked healthy, so the grown backoff
    // belongs to an older failure and should not delay the replacement.
    this.backoffMs = 1000;

    // Ends the `for await` in the supervised loop.
    this.nc.close().catch(() => {});
  }

  /**
   * Reconnect, but only when the stream looks stalled. Safe to call on every
   * resume trigger.
   *
   * Staleness is read from the block clock rather than this subscription's own
   * traffic. Both connections share the page's socket lifecycle and so stall
   * together, and `consensus` is the only subject chatty enough for silence to
   * be meaningful — `structs.>` can be legitimately quiet for minutes.
   *
   * @param {number} staleMs
   * @return {boolean} whether a reconnect was triggered
   */
  resumeCheck(staleMs = STALE_BLOCK_MS) {
    if (this.gameState.msSinceLastBlock() < staleMs) {
      return false;
    }

    // A new connection needs to receive its first block before the clock can
    // clear, so give it that long. Resume triggers arrive in pairs (focus fires
    // alongside visibilitychange) and would otherwise tear down the reconnect
    // that the first one just started.
    if (Date.now() - this.lastForcedReconnectAt < staleMs) {
      return false;
    }

    this.reconnect();
    return true;
  }

  /**
   * Supervised connect → subscribe → consume loop. On any close/error it backs
   * off and reconnects for as long as `running` is true.
   * @private
   */
  async _supervise() {
    if (this.supervising) return;
    this.supervising = true;

    while (this.running) {
      try {
        this.nc = await natsCore.wsconnect({
          servers: this.grassServerUrl,
          maxReconnectAttempts: -1, // never give up on transient drops
          reconnectTimeWait: 2000,
          waitOnFirstConnect: true,
        });
        this.backoffMs = 1000; // reset backoff on a good connect
        console.info('[GrassManager] connected:', this.subject);

        this.subscription = this.nc.subscribe(this.subject);

        for await (const message of this.subscription) {
          let messageData;
          try {
            messageData = this.getMessageData(message);
          } catch (e) {
            continue; // bad frame — skip, don't kill the loop
          }

          this.logMessageData(messageData);

          if (this.shouldIgnoreMessage(messageData)) continue;

          this.listeners.forEach((listener) => {
            try {
              listener.handler(messageData);
              if (listener.shouldUnregister()) {
                this.unregisterListener(listener.name);
              }
            } catch (e) {
              console.warn('[GrassManager] listener error:', listener.name, e);
            }
          });
        }
        // for-await ended → subscription/connection closed.
        console.warn('[GrassManager] subscription ended:', this.subject);
      } catch (e) {
        console.warn('[GrassManager] connection error:', this.subject, e);
      }

      // Clean up before retrying.
      try { await this.nc?.close(); } catch (e) {}
      this.nc = null;
      this.subscription = null;

      if (!this.running) break;

      // Backoff, then reconnect.
      await new Promise((resolve) => setTimeout(resolve, this.backoffMs));
      this.backoffMs = Math.min(this.backoffMs * 2, this.backoffMax);
    }

    this.supervising = false;
  }
}
