export class HttpError extends Error {

  /**
   * @param {string} message
   * @param {number} status
   * @param {Error|null} [cause]
   */
  constructor(message, status, cause = null) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}
