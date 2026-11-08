import {abortableDelay} from "./AbortableDelay";

const FIRST_DELAY_MS = 2000;
const MAX_DELAY_MS = 30000;

/**
 * Calls read until it returns something other than undefined, waiting 2s and
 * then doubling up to 30s between attempts. A failed read is logged and retried
 * unless isFinal(error) says it ends the wait.
 *
 * @param {function(): Promise<*>} read
 * @param {AbortSignal} signal
 * @param {object} options
 * @param {string} options.label console prefix for a failed read
 * @param {function(number, AbortSignal): Promise<void>} [options.wait] may wake early, e.g. on a notification
 * @param {function(Error): boolean} [options.isFinal]
 * @return {Promise<*>} the first value read returned
 */
export async function pollUntil(read, signal, {label, wait = abortableDelay, isFinal = () => false}) {
  let delay = FIRST_DELAY_MS;
  while (!signal.aborted) {
    try {
      const result = await read();
      signal.throwIfAborted();
      if (result !== undefined) return result;
    } catch (error) {
      signal.throwIfAborted();
      if (isFinal(error)) throw error;
      console.debug(label, error);
    }
    await wait(delay, signal);
    delay = Math.min(delay * 2, MAX_DELAY_MS);
  }
  signal.throwIfAborted();
}
