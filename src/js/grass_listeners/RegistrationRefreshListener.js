import {AbstractGrassListener} from "../framework/AbstractGrassListener";

let nextObserver = 0;

/** GRASS shortens a polling delay; it never establishes registration authority. */
export class RegistrationRefreshListener extends AbstractGrassListener {
  constructor(grassManager, matches) {
    super(`REGISTRATION_REFRESH_${++nextObserver}`);
    this.grassManager = grassManager;
    this.matches = matches;
    this.requested = false;
    this.wake = null;
    grassManager?.registerListener(this);
  }

  handler(message) {
    if (!this.matches(message)) return;
    this.requested = true;
    this.wake?.();
  }

  /** Coalesce notifications, including ones received during the preceding read. */
  wait(delay, signal) {
    signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const earliest = Date.now() + 1000;
      let timer;
      const finish = (error) => {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        this.wake = null;
        this.requested = false;
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(signal.reason);
      this.wake = () => {
        clearTimeout(timer);
        timer = setTimeout(() => finish(), Math.max(0, earliest - Date.now()));
      };
      signal.addEventListener('abort', abort, {once: true});
      timer = setTimeout(() => finish(), delay);
      if (this.requested) this.wake();
    });
  }

  close() {
    this.grassManager?.unregisterListener(this.name);
  }
}
