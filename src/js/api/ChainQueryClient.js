import {QueryClient} from "@cosmjs/stargate";
import {CHAIN} from "../constants/ChainConstants";
import {exactQueryHeight} from "../util/ChainProtocol";

const REQUEST_TIMEOUT_MS = 5000;
const SNAPSHOT_TIMEOUT_MS = 15000;
const MAX_QUERIES = 64;
const MAX_RESPONSE_BYTES = 1048576;

/**
 * Height-pinned protobuf RPC on the same explicitly owned Comet connection as
 * the signer. QueryClient's public API retains the returned height; the usual
 * createProtobufRpcClient helper discards it and cannot certify a snapshot.
 */
export class ChainQueryClient {
  constructor(cometClient, {requestTimeoutMs = REQUEST_TIMEOUT_MS, snapshotTimeoutMs = SNAPSHOT_TIMEOUT_MS} = {}) {
    this.cometClient = cometClient;
    this.queryClient = new QueryClient(cometClient);
    this.requestTimeoutMs = requestTimeoutMs;
    this.snapshotTimeoutMs = snapshotTimeoutMs;
    this.closed = false;
    this.closedSignal = new Promise((resolve, reject) => { this.rejectClosed = reject; });
    this.closedSignal.catch(() => {});
  }

  disconnect() {
    if (this.closed) return;
    this.closed = true;
    this.rejectClosed(new Error('Chain query connection closed'));
    try {
      this.cometClient.disconnect();
    } catch (error) {
      console.warn('[ChainQueryClient] error closing connection:', error);
    }
  }

  async status() {
    const status = await this.#request(() => this.cometClient.status());
    if (status.nodeInfo?.network !== CHAIN.ID || !/^(0\.38\.|1\.0\.)/.test(status.nodeInfo?.version ?? '')
        || status.syncInfo?.catchingUp !== false) {
      throw new Error('Chain identity, RPC version or synchronization is unsupported');
    }
    return Object.freeze({chainId: CHAIN.ID, height: exactQueryHeight(status.syncInfo.latestBlockHeight)});
  }

  /**
   * The callback stages a complete result. Every generated QueryClientImpl can
   * use snapshot.request as its Rpc; all pages share the exact height, deadline
   * and query budget. No partial result is published on failure. Callbacks must
   * not mutate application state or start unawaited requests.
   */
  async readSnapshot(read, {height = null} = {}) {
    let active = true;
    let requests = 0;
    let failure = null;
    const pending = new Set();
    const assertActive = () => {
      if (this.closed || !active) throw new Error('Chain snapshot expired or closed');
      if (failure) throw failure;
    };
    try {
      return await this.#request(async () => {
        const initial = await this.status();
        assertActive();
        const selected = height === null ? initial.height : exactQueryHeight(height);
        if (BigInt(selected) > BigInt(initial.height)) throw new Error('Chain snapshot height is ahead of the node');
        const request = (service, method, bytes) => {
          const operation = (async () => {
            assertActive();
            if (++requests > MAX_QUERIES) throw new Error('Chain snapshot query limit exceeded');
            if (typeof service !== 'string' || !/^[A-Za-z_]\w*(\.[A-Za-z_]\w*)+$/.test(service)
                || typeof method !== 'string' || !/^[A-Za-z_]\w*$/.test(method)
                || !(bytes instanceof Uint8Array) || bytes.length > MAX_RESPONSE_BYTES) {
              throw new Error('Invalid protobuf query');
            }
            const result = await this.#request(() => this.queryClient.queryAbci(`/${service}/${method}`, bytes, Number(selected)));
            assertActive();
            if (exactQueryHeight(result.height) !== selected) throw new Error('Chain query returned a different height');
            if (!(result.value instanceof Uint8Array) || result.value.length > MAX_RESPONSE_BYTES) {
              throw new Error('Chain query response is invalid or too large');
            }
            return result.value;
          })();
          pending.add(operation);
          operation.then(() => pending.delete(operation), error => {
            pending.delete(operation);
            failure = error;
          });
          return operation;
        };
        const data = await read(Object.freeze({chainId: initial.chainId, height: selected, request}));
        assertActive();
        if (pending.size) throw new Error('Chain snapshot has unfinished queries');
        const latest = await this.status();
        assertActive();
        if (BigInt(latest.height) < BigInt(initial.height)) throw new Error('Chain height regressed during snapshot');
        return Object.freeze({chainId: initial.chainId, height: selected, observedHeight: latest.height, data});
      }, this.snapshotTimeoutMs);
    } finally {
      active = false;
    }
  }

  async #request(read, timeoutMs = this.requestTimeoutMs) {
    if (this.closed) throw new Error('Chain query connection closed');
    let timer;
    const deadline = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('Chain query timed out'));
        // Closing also releases the WS request listeners for unanswered calls.
        this.disconnect();
      }, timeoutMs);
    });
    try {
      const result = await Promise.race([Promise.resolve().then(read), this.closedSignal, deadline]);
      if (this.closed) throw new Error('Chain query connection closed');
      return result;
    } finally {
      clearTimeout(timer);
    }
  }
}
