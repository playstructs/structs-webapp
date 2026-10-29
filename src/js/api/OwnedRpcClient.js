const MAX_PENDING = 64;
const MAX_MESSAGE_BYTES = 2 * 1048576;

/**
 * CosmJS's public RpcClient interface, without automatic reconnection. The
 * installed ReconnectingSocket schedules a reconnect even from disconnect().
 * SigningClientManager owns reconnection; discarded clients must stay closed.
 * Block subscriptions continue to use the existing separate GRASS connection.
 */
export class OwnedRpcClient {
  constructor(endpoint, {timeoutMs = 5000} = {}) {
    this.closed = false;
    this.pending = new Map();
    this.timeoutMs = timeoutMs;
    const url = new URL(endpoint);
    if (!['ws:', 'wss:'].includes(url.protocol)) throw new Error('Expected a WebSocket RPC endpoint');
    url.pathname = url.pathname.replace(/\/$/, '') + '/websocket';
    this.socket = new WebSocket(url.toString());
    this.socket.onopen = () => {
      if (this.closed) { this.socket.close(); return; }
      for (const entry of this.pending.values()) this.#send(entry);
    };
    this.socket.onmessage = event => this.#receive(event.data);
    this.socket.onerror = () => this.#close(new Error('RPC connection failed'));
    this.socket.onclose = () => this.#close(new Error('RPC connection closed'));
  }

  execute(request) {
    if (this.closed) return Promise.reject(new Error('RPC connection closed'));
    if (!request || request.jsonrpc !== '2.0' || !['string', 'number'].includes(typeof request.id)
        || (typeof request.id === 'number' && !Number.isSafeInteger(request.id))
        || typeof request.method !== 'string' || this.pending.has(request.id) || this.pending.size >= MAX_PENDING) {
      return Promise.reject(new Error('Invalid or excessive RPC request'));
    }
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(request);
      if (data.length > MAX_MESSAGE_BYTES) { reject(new Error('RPC request too large')); return; }
      const timer = setTimeout(() => this.#close(new Error('RPC request timed out')), this.timeoutMs);
      const entry = {data, resolve, reject, timer};
      this.pending.set(request.id, entry);
      if (this.socket.readyState === WebSocket.OPEN) this.#send(entry);
    });
  }

  disconnect() {
    this.#close(new Error('RPC connection closed'));
  }

  #send(entry) {
    if (this.closed) return;
    try { this.socket.send(entry.data); }
    catch (error) { this.#close(error); }
  }

  #receive(data) {
    if (this.closed) return;
    try {
      if (typeof data !== 'string' || data.length > MAX_MESSAGE_BYTES
          || new TextEncoder().encode(data).length > MAX_MESSAGE_BYTES) throw new Error('Invalid or oversized RPC response');
      const response = JSON.parse(data);
      if (!response || response.jsonrpc !== '2.0' || !['string', 'number'].includes(typeof response.id)
          || Object.hasOwn(response, 'result') === Object.hasOwn(response, 'error')) throw new Error('Invalid RPC response');
      const entry = this.pending.get(response.id);
      if (!entry) return;
      this.pending.delete(response.id);
      clearTimeout(entry.timer);
      if (Object.hasOwn(response, 'error')) {
        entry.reject(new Error(`RPC query failed: ${response.error?.code ?? 'unknown'} ${response.error?.message ?? ''}`));
      } else {
        entry.resolve(response);
      }
    } catch (error) {
      this.#close(error);
    }
  }

  #close(error) {
    if (this.closed) return;
    this.closed = true;
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    this.pending.clear();
    try { this.socket.close(); }
    catch { /* A connection still opening is closed by onopen as well. */ }
  }
}
