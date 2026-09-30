import {fmtToken} from "../util/Units";

/**
 * Cached /api/denom registry. Built-in Units ladders remain the fallback so
 * formatting never blocks login or HUD startup.
 */
export class DenomManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    /** @type {object|null} */
    this.registry = null;
    /** @type {Map<string, object>} */
    this.unitsByDenom = new Map();
  }

  /**
   * Load the registry after authentication. Safe to call multiple times.
   * Failures leave built-in ladders in place.
   *
   * @return {Promise<object|null>}
   */
  async load() {
    try {
      const data = await this.guildAPI.getDenoms();
      this.setRegistry(data);
      return data;
    } catch (err) {
      console.warn('DenomManager: failed to load /api/denom; using built-in ladders', err);
      return null;
    }
  }

  /**
   * @param {object} data
   */
  setRegistry(data) {
    this.registry = data;
    this.unitsByDenom = new Map();
    if (Array.isArray(data?.units)) {
      for (const unit of data.units) {
        if (unit?.denom) {
          this.unitsByDenom.set(unit.denom, unit);
        }
      }
    }
  }

  /**
   * @param {string} denom
   * @return {object|null}
   */
  getUnit(denom) {
    if (!denom) {
      return null;
    }
    const base = this.stripStateSuffix(denom);
    return this.unitsByDenom.get(base) ?? null;
  }

  /**
   * @param {string} denom
   * @return {string}
   */
  stripStateSuffix(denom) {
    const suffixes = this.registry?.state_suffixes ?? ['infused', 'defusing'];
    for (const suffix of suffixes) {
      const needle = `.${suffix}`;
      if (denom.endsWith(needle)) {
        return denom.slice(0, -needle.length);
      }
    }
    return denom;
  }

  /**
   * @param {bigint|string|number|null|undefined} amount
   * @param {string} denom
   * @return {string}
   */
  formatToken(amount, denom) {
    const unit = this.getUnit(denom);
    if (!unit) {
      return fmtToken(amount, {denom: denom ?? 'raw'});
    }
    return fmtToken(amount, unit);
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return this.registry !== null;
  }
}
