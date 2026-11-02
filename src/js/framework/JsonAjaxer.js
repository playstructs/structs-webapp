import {HttpError} from "../errors/HttpError";
import {AuthenticationError} from "../errors/AuthenticationError";

/**
 * Encapsulate and abstract HTTP request methods.
 */
export class JsonAjaxer {

  constructor() {
    /**
     * Invoked when a request comes back 401/403. Resolving true means the
     * session was restored and the request is worth sending again.
     *
     * @type {?function(): Promise<boolean>}
     */
    this.onUnauthorized = null;
  }

  async get (url, options = {}) {
    return this.request('GET', url, undefined, options);
  }

  async post (url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  async put (url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  async delete (url, data, options = {}) {
    return this.request('DELETE', url, data, options);
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {object} [data]
   * @return {Promise<object>}
   */
  async request (method, url, data = undefined, {signal, timeoutMs=15000, reauthenticate=true} = {}) {
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, {once: true});
    const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      let response = await this.send(method, url, data, controller.signal);

      if (this.isAuthFailure(response) && this.onUnauthorized && reauthenticate) {
        controller.signal.throwIfAborted();
        if (await this.waitForAuthorization(controller.signal)) {
          response = await this.send(method, url, data, controller.signal);
        }
      }

      controller.signal.throwIfAborted();
      if (this.isAuthFailure(response)) {
        throw new AuthenticationError(
          `${method} ${url} requires an authenticated session.`,
          response.status
        );
      }

      return await this.parse(response, method, url);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }

  /** A shared login may continue, but a departed/timed-out read must release its observer. */
  async waitForAuthorization(signal) {
    signal.throwIfAborted();
    let abort;
    const cancelled = new Promise((resolve, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener('abort', abort, {once: true});
    });
    try {
      return await Promise.race([this.onUnauthorized(), cancelled]);
    } finally {
      signal.removeEventListener('abort', abort);
    }
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {object} [data]
   * @return {Promise<Response>}
   */
  async send (method, url, data = undefined, signal = undefined) {
    signal?.throwIfAborted();
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      signal
    };

    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }

    return fetch(url, options);
  }

  /**
   * @param {Response} response
   * @return {boolean}
   */
  isAuthFailure (response) {
    return response.status === 401 || response.status === 403;
  }

  /**
   * @param {Response} response
   * @param {string} method
   * @param {string} url
   * @return {Promise<object>}
   */
  async parse (response, method, url) {
    if (response.status >= 500) {
      throw new HttpError(`${method} ${url} failed with status ${response.status}.`,response.status);
    }
    try {
      return await response.json();
    } catch (error) {
      throw new HttpError(
        `${method} ${url} returned a non-JSON body with status ${response.status}.`,
        response.status,
        error
      );
    }
  }
}
