import {GuildAPIResponseFactory} from "../factories/GuildAPIResponseFactory";
import {GuildAPIError} from "../errors/GuildAPIError";

/**
 * Read-only client for the Sector Blitz contest API (/api/influence).
 * Scores, points and heights are exact decimal strings.
 */
export class InfluenceAPI {

  /**
   * @param {GuildAPI} guildAPI shares its authenticated transport and session recovery
   */
  constructor(guildAPI) {
    this.ajax = guildAPI.ajax;
    this.apiUrl = '/api/influence';
    this.responseFactory = new GuildAPIResponseFactory();
  }

  /**
   * @param {string} path
   * @param {object} params
   * @param {object} options
   * @return {Promise<GuildAPIResponse>}
   */
  async get(path, params = {}, options = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query.set(key, `${value}`);
      }
    });
    const queryString = query.toString();
    const jsonResponse = await this.ajax.get(`${this.apiUrl}${path}${queryString ? `?${queryString}` : ''}`, options);
    const response = this.responseFactory.make(jsonResponse);
    if (!response.success) {
      throw new GuildAPIError(`Influence API request was unsuccessful: ${JSON.stringify(response.errors)}`);
    }
    return response;
  }

  /**
   * Every configured contest, oldest first.
   *
   * @return {Promise<object[]>}
   */
  async getContests(options = {}) {
    const contests = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && page <= 10) {
      const response = await this.get(page === 1 ? '/contests' : `/contests/page/${page}`, {limit: 100}, options);
      contests.push(...response.data);
      hasMore = !!response.meta?.has_more;
      page++;
    }
    return contests;
  }

  /**
   * Every guild's score in every scoring sector.
   *
   * @param {string} contestId
   * @return {Promise<GuildAPIResponse>}
   */
  async getStandings(contestId, options = {}) {
    return this.get(`/contests/${contestId}/standings`, {}, options);
  }

  /**
   * Ranked guilds: by sector points when a sector is given, otherwise by sectors controlled.
   *
   * @param {string} contestId
   * @param {number|null} sector
   * @param {number} page
   * @param {number} limit
   * @param {boolean} scoredOnly
   * @return {Promise<GuildAPIResponse>}
   */
  async getGuildRanks(contestId, sector = null, page = 1, limit = 10, scoredOnly = true, options = {}) {
    return this.get(
      page > 1 ? `/contests/${contestId}/guilds/page/${page}` : `/contests/${contestId}/guilds`,
      {sector, limit, include_total: 1, scored_only: scoredOnly ? 1 : 0},
      options
    );
  }

  /**
   * Ranked players by personal points.
   *
   * @param {string} contestId
   * @param {number|null} sector
   * @param {number} page
   * @param {number} limit
   * @param {boolean} scoredOnly
   * @return {Promise<GuildAPIResponse>}
   */
  async getPlayerRanks(contestId, sector = null, page = 1, limit = 10, scoredOnly = true, options = {}) {
    return this.get(
      page > 1 ? `/contests/${contestId}/players/page/${page}` : `/contests/${contestId}/players`,
      {sector, limit, include_total: 1, scored_only: scoredOnly ? 1 : 0},
      options
    );
  }

  /**
   * One player's personal scores and rank, or null if they are not in the contest roster.
   *
   * @param {string} contestId
   * @param {string} playerId
   * @param {number|null} sector
   * @return {Promise<object|null>}
   */
  async getPlayer(contestId, playerId, sector = null, options = {}) {
    try {
      return (await this.get(`/contests/${contestId}/players/${playerId}`, {sector}, options)).data;
    } catch (error) {
      if (error instanceof GuildAPIError) {
        return null;
      }
      throw error;
    }
  }
}
