export class PlayerOreStats {
  constructor() {
    this.player_id = null;
    this.forfeited = null;
    /** @type {bigint|null} grams */
    this.forfeited_p = null;
    this.mined = null;
    /** @type {bigint|null} grams */
    this.mined_p = null;
    this.seized = null;
    /** @type {bigint|null} grams */
    this.seized_p = null;
  }
}
