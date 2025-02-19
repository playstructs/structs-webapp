export class SUINotImplementedError extends Error {

  /**
   * @param {string} message
   */
  constructor(message= '') {
    super(message);
    this.name = "SUINotImplementedError";
    this.message = message ? message : 'Method not implemented';
  }
}
