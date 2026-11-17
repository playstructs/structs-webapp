import {AbstractGrassListener} from "./AbstractGrassListener";
import {EVENTS} from "../constants/Events";

/**
 * Minimal async queue with the subscription surface InfluenceStream consumes.
 */
class AsyncMessageQueue {
  constructor() {
    this.items = [];
    this.wake = null;
    this.closed = false;
  }

  push(value) {
    if (this.closed) return;
    this.items.push(value);
    this.wake?.();
    this.wake = null;
  }

  unsubscribe() {
    this.closed = true;
    this.wake?.();
    this.wake = null;
  }

  stop() {
    this.unsubscribe();
  }

  async *[Symbol.asyncIterator]() {
    while (!this.closed) {
      if (this.items.length) {
        yield this.items.shift();
      } else {
        await new Promise(resolve => this.wake = resolve);
      }
    }
  }
}

/**
 * Feeds influence frames from the game's existing GRASS subscription ("structs.>")
 * into InfluenceStream, so contest updates do not need a second NATS socket.
 * GRASS reconnects are reported as NATS 'reconnect' status events, which makes
 * InfluenceStream resync from the API as it would on its own connection.
 */
export class GrassInfluenceConnection extends AbstractGrassListener {

  /**
   * @param {GrassManager} grassManager
   * @param {string} name unique listener name
   */
  constructor(grassManager, name) {
    super(name);
    this.grassManager = grassManager;
    this.subscriptions = new Map();
    this.statusQueues = new Set();
    this.onGrassConnected = () => this.statusQueues.forEach(queue => queue.push({type: 'reconnect'}));
  }

  handler(messageData) {
    const queue = this.subscriptions.get(messageData.subject);
    if (queue) {
      queue.push({json: () => messageData});
    }
  }

  /**
   * @param {string} subject
   * @return {AsyncMessageQueue}
   */
  subscribe(subject) {
    const queue = new AsyncMessageQueue();
    const unsubscribe = queue.unsubscribe.bind(queue);
    queue.unsubscribe = () => {
      unsubscribe();
      if (this.subscriptions.get(subject) === queue) {
        this.subscriptions.delete(subject);
      }
      this.detachIfIdle();
    };
    this.subscriptions.set(subject, queue);
    this.grassManager.registerListener(this);
    window.addEventListener(EVENTS.GRASS_CONNECTED, this.onGrassConnected);
    return queue;
  }

  status() {
    const queue = new AsyncMessageQueue();
    const unsubscribe = queue.unsubscribe.bind(queue);
    queue.unsubscribe = () => {
      unsubscribe();
      this.statusQueues.delete(queue);
    };
    queue.stop = queue.unsubscribe;
    this.statusQueues.add(queue);
    return queue;
  }

  async flush() {
    // Frames arrive on the shared, already-subscribed GRASS stream.
  }

  detachIfIdle() {
    if (this.subscriptions.size === 0) {
      this.grassManager.unregisterListener(this.name);
      window.removeEventListener(EVENTS.GRASS_CONNECTED, this.onGrassConnected);
    }
  }
}
