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

  async get (url) {
    return this.request('GET', url);
  }

  async post (url, data) {
    return this.request('POST', url, data);
  }

  async put (url, data) {
    return this.request('PUT', url, data);
  }

  async delete (url, data) {
    return this.request('DELETE', url, data);
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {object} [data]
   * @return {Promise<object>}
   */
  async request (method, url, data = undefined) {
    let response = await this.send(method, url, data);

    if (this.isAuthFailure(response) && this.onUnauthorized) {
      if (await this.onUnauthorized()) {
        response = await this.send(method, url, data);
      }
    }

    if (this.isAuthFailure(response)) {
      throw new AuthenticationError(
        `${method} ${url} requires an authenticated session.`,
        response.status
      );
    }

    return this.parse(response, method, url);
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {object} [data]
   * @return {Promise<Response>}
   */
  async send (method, url, data = undefined) {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
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
