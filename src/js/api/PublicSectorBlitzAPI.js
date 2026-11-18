/**
 * Client for the public Sector Blitz API (/api/public/sector-blitz). No sign-in is needed.
 * The server caches every response per published scoring build, so these reads are cheap.
 */
export class PublicSectorBlitzAPI {

  constructor() {
    this.apiUrl = '/api/public/sector-blitz';
  }

  /**
   * @param {string} path
   * @param {object} params
   * @return {Promise<object>} the response's data
   */
  async get(path, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query.set(key, `${value}`);
      }
    });
    const queryString = query.toString();
    const response = await fetch(`${this.apiUrl}${path}${queryString ? `?${queryString}` : ''}`, {
      headers: {Accept: 'application/json'},
    });
    if (!response.ok) {
      throw new Error(`Sector Blitz request failed with status ${response.status}`);
    }
    const body = await response.json();
    if (!body.success) {
      throw new Error(`Sector Blitz request was unsuccessful: ${JSON.stringify(body.errors)}`);
    }
    return body.data;
  }

  /**
   * The contest, sector standings and overall guild ranks; with a sector after the contest,
   * also that sector's podium.
   *
   * @param {number|null} sector
   * @return {Promise<{phase: string, contest: ?object, available: boolean, standings: object[], guilds: object[], podium: ?object}>}
   */
  getSummary(sector = null) {
    return this.get('', {sector});
  }

  /**
   * @param {number|null} sector
   * @param {number} page
   * @return {Promise<{data: object[], total: string}>}
   */
  getGuilds(sector = null, page = 1) {
    return this.get('/guilds', {sector, page});
  }

  /**
   * @param {number|null} sector
   * @param {number} page
   * @return {Promise<{data: object[], total: string}>}
   */
  getPlayers(sector = null, page = 1) {
    return this.get('/players', {sector, page});
  }

  /**
   * @param {number} page
   * @return {Promise<{data: object[], total: string}>}
   */
  getBattles(page = 1) {
    return this.get('/battles', {page});
  }
}
