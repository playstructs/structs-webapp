import {EVENTS} from "../constants/Events";

/**
 * Dispatched when a queued signing transaction reaches a terminal state
 * (succeeded / dropped / cancelled). Carries `accountAddress` so listeners can
 * filter per account once multi-account lands.
 */
export class SigningTransactionSettledEvent extends CustomEvent {
  /**
   * @param {string} id
   * @param {string} status - One of TX_STATUS terminal values.
   * @param {string} accountAddress
   * @param {object|null} response
   * @param {string|null} error
   */
  constructor(id, status, accountAddress, response, error) {
    super(EVENTS.SIGNING_TRANSACTION_SETTLED);
    this.id = id;
    this.status = status;
    this.accountAddress = accountAddress;
    this.response = response;
    this.error = error;
  }
}
