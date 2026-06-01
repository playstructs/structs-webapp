import * as natsCore from "@nats-io/nats-core";

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
   */
  constructor(grassServerUrl, subject) {
    this.grassServerUrl = grassServerUrl;
    this.subject = subject;
    this.listeners = new Map();

    // Connection lifecycle state
    this.nc = null;
    this.subscription = null;
    this.running = false;       // true between init()/reconnect() and close()
    this.supervising = false;   // guards against overlapping supervise loops
    this.backoffMs = 1000;      // grows to backoffMax on repeated failures
    this.backoffMax = 30000;
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
   * Start the stream. Idempotent: a second call while already running is a no-op.
   */
  init() {
    if (this.running) return;
    this.running = true;
    this.backoffMs = 1000;
    this._supervise(); // fire-and-forget supervised loop
  }

  /**
   * Force a fresh connection. Safe to call externally (resume-check / watchdog).
   * @return {Promise<void>}
   */
  async reconnect() {
    console.info('[GrassManager] reconnect requested:', this.subject);
    this.running = true;
    this.backoffMs = 1000;
    try { await this.nc?.close(); } catch (e) {} // ends the for-await; loop re-connects
    if (!this.supervising) this._supervise();
  }

  /**
   * Stop the stream entirely.
   * @return {Promise<void>}
   */
  async close() {
    this.running = false;
    try { this.subscription?.unsubscribe(); } catch (e) {}
    try { await this.nc?.close(); } catch (e) {}
    this.subscription = null;
    this.nc = null;
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

          console.log(messageData);

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
