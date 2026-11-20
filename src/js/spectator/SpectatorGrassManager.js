import {GrassManager} from "../framework/GrassManager";

/**
 * GRASS for a spectator: instead of every message on the chain (structs.>), only the raided
 * planet's messages and the two players' grid messages (charge and ore), on one connection.
 */
export class SpectatorGrassManager extends GrassManager {

  /**
   * @param {string} grassServerUrl
   * @param {string[]} subjects
   * @param {GameState} gameState
   */
  constructor(grassServerUrl, subjects, gameState) {
    super(grassServerUrl, subjects.join(' + '), gameState);
    this.subjects = subjects;
  }

  /** Starts only once the raid's subjects are known (resume checks call this early too). */
  init() {
    if (this.subjects.length > 0) {
      super.init();
    }
  }

  /** Stop listening for good: the battle is over. */
  stop() {
    this.subjects = [];
    this.running = false;
    this.listeners.clear();
    this.nc?.close().catch(() => {});
  }

  /**
   * One iterable over several subscriptions. Ends when the connection closes, as one
   * subscription would.
   *
   * @param {object} nc NATS connection
   * @return {AsyncIterable<MsgImpl>}
   */
  subscribe(nc) {
    const subscriptions = this.subjects.map(subject => nc.subscribe(subject));
    const iterators = subscriptions.map(subscription => subscription[Symbol.asyncIterator]());
    const pending = new Map();
    const next = index => iterators[index].next().then(result => ({index, result}));
    iterators.forEach((iterator, index) => pending.set(index, next(index)));

    return {
      async* [Symbol.asyncIterator]() {
        while (pending.size > 0) {
          const {index, result} = await Promise.race(pending.values());
          if (result.done) {
            pending.delete(index);
            continue;
          }
          pending.set(index, next(index));
          yield result.value;
        }
      }
    };
  }
}
