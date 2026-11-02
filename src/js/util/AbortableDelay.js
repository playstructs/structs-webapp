/** A view's navigation signal releases both its timer and abort listener. */
export function abortableDelay(delay, signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, delay);
    signal.addEventListener('abort', abort, {once: true});
  });
}
