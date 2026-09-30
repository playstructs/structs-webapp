export class Transaction {
  constructor() {
    this.time = null;
    this.id = null;
    this.object_id = null;
    this.address = null;
    this.counterparty = null;
    this.counterparty_player_id = null;
    this.counterparty_username = null;
    this.amount = null;
    /** @type {bigint|null} base units */
    this.amount_p = null;
    /** @type {boolean} false when amount_p was derived from a legacy display value */
    this.precise = true;
    this.block_height = null;
    this.action = null;
    this.direction = null;
    this.denom = null;
  }
}