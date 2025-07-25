import {JsonAjaxer} from "../framework/JsonAjaxer";
import {GuildFactory} from "../factories/GuildFactory";
import {PlayerFactory} from "../factories/PlayerFactory";
import {GuildAPIResponseFactory} from "../factories/GuildAPIResponseFactory";
import {GuildAPIError} from "../errors/GuildAPIError";
import {GuildAPICacheItemDTO} from "../dtos/GuildAPICacheItemDTO";
import {InfusionFactory} from "../factories/InfusionFactory";
import {PlayerOreStatsFactory} from "../factories/PlayerOreStatsFactory";
import {PlanetFactory} from "../factories/PlanetFactory";
import {PlayerAddressFactory} from "../factories/PlayerAddressFactory";
import {Guild} from "../models/Guild";
import {ActivationCodeInfoDTO} from "../dtos/ActivationCodeInfoDTO";
import {TransactionFactory} from "../factories/TransactionFactory";
import {PlayerSearchResultDTOFactory} from "../factories/PlayerSearchResultDTOFactory";
import {GuildPowerStatsDTOFactory} from "../factories/GuildPowerStatsDTOFactory";
import {GuildSearchResultDTOFactory} from "../factories/GuildSearchResultDTOFactory";
import {PlanetaryShieldInfoDTOFactory} from "../factories/PlanetaryShieldInfoDTOFactory";

export class GuildAPI {

  constructor() {
    this.apiUrl = '/api';
    this.ajax = new JsonAjaxer();
    this.guildAPIResponseFactory = new GuildAPIResponseFactory();
    this.guildFactory = new GuildFactory();
    this.playerFactory = new PlayerFactory();
    this.infusionFactory = new InfusionFactory();
    this.playerOreStatsFactory = new PlayerOreStatsFactory();
    this.planetFactory = new PlanetFactory();
    this.playerAddressFactory = new PlayerAddressFactory();
    this.transactionFactory = new TransactionFactory();
    this.playerSearchResultDTOFactory = new PlayerSearchResultDTOFactory();
    this.guildPowerStatsDTOFactory = new GuildPowerStatsDTOFactory();
    this.guildSearchResultDTOFactory = new GuildSearchResultDTOFactory();
    this.planetaryShieldInfoDTOFactory = new PlanetaryShieldInfoDTOFactory();
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  cacheItem(key, value) {
    const item = new GuildAPICacheItemDTO(value);
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * @param {string} key
   * @param {number} ttl
   * @return {null|*}
   */
  getCachedItem(key, ttl = 1000 * 60 * 60) {
    let item = localStorage.getItem(key);

    if (item === null) {
      return null;
    }

    item = JSON.parse(item);

    if (item.timestamp + ttl < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }

  /**
   * @param {string} playerId
   * @param {string} address
   * @return {string}
   */
  buildAddressRegisterMessage(playerId, address) {
    return `PLAYER${playerId}ADDRESS${address}`;
  }

  /**
   * @param {string} guildId
   * @param {string} address
   * @param {number} nonce
   * @return {string}
   */
  buildGuildMembershipJoinProxyMessage(guildId, address, nonce) {
    return `GUILD${guildId}ADDRESS${address}NONCE${nonce}`;
  }

  /**
   *
   * @param {string} guildId
   * @param {string} address
   * @param {string} unixTimestamp
   * @return {string}
   */
  buildLoginMessage(guildId, address, unixTimestamp) {
    return `LOGIN_GUILD${guildId}ADDRESS${address}DATETIME${unixTimestamp}`;
  }

  /**
   * @param {GuildAPIResponse} guildAPIResponse
   */
  handleResponseFailure(guildAPIResponse) {
    if (!guildAPIResponse.success) {
      throw new GuildAPIError(`Guild API request was unsuccessful. See network request for details.`);
    }
  }

  /**
   * @param {string} requestUrl
   * @param {string} dataProperty
   * @return {Promise<*>}
   */
  async getSingleDataValue(requestUrl, dataProperty) {
    const jsonResponse = await this.ajax.get(requestUrl);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);

    if (response.data === null
      || response.data === undefined
      || !response.data.hasOwnProperty(dataProperty)
    ) {
      throw new GuildAPIError(`Data does not contain required property (${dataProperty}).`);
    }

    return response.data[dataProperty];
  }

  /**
   * @return {Promise<Guild>}
   */
  async getThisGuild() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/this`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.guildFactory.make(response.data);
  }

  /**
   * @return {Promise<string>}
   */
  async getTimestamp() {
    const timestamp = await this.getSingleDataValue(`${this.apiUrl}/timestamp`, 'unix_timestamp');
    return `${timestamp}`;
  }

  /**
   * @param {SignupRequestDTO} signupRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async signup(signupRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/signup`, signupRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {LoginRequestDTO} loginRequestDTO
   * @return {GuildAPIResponse}
   */
  async login(loginRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/login`, loginRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  async logout() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/auth/logout`);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {string} playerId
   * @return {Promise<Player>}
   */
  async getPlayer(playerId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/${playerId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerFactory.make(response.data);
  }

  /**
   * @param {string} playerId
   * @return {Promise<number>}
   */
  async getPlayerLastActionBlockHeight(playerId) {
    const lastActionBlockHeight = await this.getSingleDataValue(`${this.apiUrl}/player/${playerId}/action/last/block/height`, 'last_action_block_height');
    return parseInt(lastActionBlockHeight);
  }

  /**
   * @param {string} playerId
   * @return {string}
   */
  getPlayerAddressCountCacheKey(playerId) {
    return `getPlayerAddressCount::${playerId}`;
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerAddressCount(playerId, forceRefresh = false) {
    let count = this.getCachedItem(this.getPlayerAddressCountCacheKey(playerId));
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player-address/count/player/${playerId}`, 'count');
      this.cacheItem(this.getPlayerAddressCountCacheKey(playerId), count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} playerId
   * @return {Promise<Infusion>}
   */
  async getInfusionByPlayerId(playerId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/infusion/player/${playerId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.infusionFactory.make(response.data);
  }

  /**
   * @param {string} playerId
   * @return {string}
   */
  getPlayerOreStatsCacheKey(playerId) {
    return `getPlayerOreStats::${playerId}`;
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<PlayerOreStats>}
   */
  async getPlayerOreStats(playerId, forceRefresh = false) {
    let response = this.getCachedItem(this.getPlayerOreStatsCacheKey(playerId));
    if (response === null || forceRefresh) {
      const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/${playerId}/ore/stats`);
      response = this.guildAPIResponseFactory.make(jsonResponse);
      this.handleResponseFailure(response);
      this.cacheItem(this.getPlayerOreStatsCacheKey(playerId), response);
    }
    return this.playerOreStatsFactory.make(response.data, playerId);
  }

  /**
   * @param {string} playerId
   * @return {string}
   */
  getPlayerPlanetsCompletedCacheKey(playerId) {
    return `getPlayerPlanetsCompleted::${playerId}`;
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerPlanetsCompleted(playerId, forceRefresh = false) {
    let count = this.getCachedItem(this.getPlayerPlanetsCompletedCacheKey(playerId));
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player/${playerId}/planet/completed`, 'count');
      this.cacheItem(this.getPlayerPlanetsCompletedCacheKey(playerId), count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} playerId
   * @return {string}
   */
  getPlayerRaidsLaunchedCacheKey(playerId) {
    return `getPlayerRaidsLaunched::${playerId}`;
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerRaidsLaunched(playerId, forceRefresh = false) {
    let count = this.getCachedItem(this.getPlayerRaidsLaunchedCacheKey(playerId));
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player/${playerId}/raid/launched`, 'count');
      this.cacheItem(this.getPlayerRaidsLaunchedCacheKey(playerId), count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} planetId
   * @return {Promise<Planet>}
   */
  async getPlanet(planetId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/planet/${planetId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.planetFactory.make(response.data);
  }

  /**
   * @param {string} planetId
   * @return {Promise<number>}
   */
  async getPlanetShieldHealth(planetId) {
    const health = await this.getSingleDataValue(`${this.apiUrl}/planet/${planetId}/shield/health`, 'health');
    return parseInt(health);
  }

  /**
   * @param {string} playerId
   * @return {Promise<PlayerAddress[]>}
   */
  async getPlayerAddressList(playerId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player-address/player/${playerId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerAddressFactory.parseList(response.data);
  }

  /**
   * @param {AddPlayerAddressMetaRequestDTO} addPlayerAddressMetaRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async addPlayerAddressMeta(addPlayerAddressMetaRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/player-address/meta`, addPlayerAddressMetaRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {CreateActivationCodeRequestDTO} createActivationCodeRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async createActivationCode(createActivationCodeRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/player-address/activation-code`, createActivationCodeRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {string} activationCode
   * @return {Promise<ActivationCodeInfoDTO|null>}
   */
  async getActivationCodeInfo(activationCode) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/auth/activation-code/${activationCode}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);

    if (response.data === null) {
      return null;
    }

    const info = new ActivationCodeInfoDTO();
    info.code = activationCode;
    Object.assign(info, response.data);

    return info;
  }

  /**
   * @param {AddPendingAddressRequestDTO} addPendingAddressRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async addPendingAddress(addPendingAddressRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/player-address`, addPendingAddressRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {SetPendingAddressPermissionsRequestDTO} setPendingAddressPermissionsRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async setPendingAddressPermissions(setPendingAddressPermissionsRequestDTO) {
    const jsonResponse = await this.ajax.put(`${this.apiUrl}/player-address/pending/permissions`, setPendingAddressPermissionsRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {string} activationCode
   * @return {Promise<GuildAPIResponse>}
   */
  async deleteActivationCode(activationCode) {
    const jsonResponse = await this.ajax.delete(`${this.apiUrl}/player-address/activation-code/${activationCode}`);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param address
   * @param guildId
   * @return {Promise<string>}
   */
  async getPlayerIdByAddressAndGuild(address, guildId) {
    return await this.getSingleDataValue(
      `${this.apiUrl}/auth/player-address/${address}/guild/${guildId}/player-id`,
      'player_id'
    );
  }

  /**
   * @param {string} address
   * @return {Promise<PlayerAddress>}
   */
  async getPlayerAddress(address) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player-address/${address}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerAddressFactory.make(response.data);
  }

  /**
   * @param {SetAddressPermissionsRequestDTO} setAddressPermissionsRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async setAddressPermissions(setAddressPermissionsRequestDTO) {
    const jsonResponse = await this.ajax.put(`${this.apiUrl}/player-address/permissions`, setAddressPermissionsRequestDTO);
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {string} username
   * @return {Promise<GuildAPIResponse>}
   */
  async setUsername(username) {
    const jsonResponse = await this.ajax.put(`${this.apiUrl}/player/username`, {username});
    return this.guildAPIResponseFactory.make(jsonResponse);
  }

  /**
   * @param {string} playerId
   * @param {number} page
   * @return {Promise<Transaction[]>}
   */
  async getTransactions(playerId, page) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/ledger/player/${playerId}/page/${page}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.transactionFactory.parseList(response.data);
  }

  /**
   * @param {string} playerId
   * @return {Promise<number>}
   */
  async countTransactions(playerId) {
    const count = await this.getSingleDataValue(`${this.apiUrl}/ledger/player/${playerId}/count`, 'count');
    return parseInt(count);
  }

  /**
   * @param {number} txId
   * @return {Promise<Transaction>}
   */
  async getTransaction(txId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/ledger/${txId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.transactionFactory.make(response.data);
  }

  /**
   * @return {Promise<Guild[]>}
   */
  async getGuildFilterList() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/name`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.guildFactory.parseList(response.data);
  }

  /**
   * @param transferSearchRequestDTO
   * @return {Promise<PlayerSearchResultDTO[]>}
   */
  async transferSearch(transferSearchRequestDTO) {
    const searchStringParam = `search_string=${transferSearchRequestDTO.search_string}`;
    const guildIdParam = transferSearchRequestDTO.guild_id ? `&guild_id=${transferSearchRequestDTO.guild_id}` : '';
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/transfer/search?${searchStringParam}${guildIdParam}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerSearchResultDTOFactory.parseList(response.data);
  }

  /**
   * @return {string}
   */
  getCountGuildMembersCacheKey(guildId) {
    return `countGuildMembers::${guildId}`;
  }

  /**
   * @param {string} guildId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async countGuildMembers(guildId, forceRefresh = false) {
    let count = this.getCachedItem(this.getCountGuildMembersCacheKey(guildId));
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/guild/${guildId}/members/count`, 'count');
      this.cacheItem(this.getCountGuildMembersCacheKey(guildId), count);
    }
    return parseInt(count);
  }

  /**
   * @return {string}
   */
  getCountGuildsCacheKey() {
    return `countGuilds`;
  }

  /**
   * @return {Promise<number>}
   */
  async countGuilds(forceRefresh = false) {
    let count = this.getCachedItem(this.getCountGuildsCacheKey());
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/guild/count`, 'count');
      this.cacheItem(this.getCountGuildsCacheKey(), count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} guildId
   * @return {Promise<Guild>}
   */
  async getGuild(guildId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/${guildId}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.guildFactory.make(response.data);
  }

  /**
   * @param {string} guildId
   * @return {string}
   */
  getGuildPowerStatsCacheKey(guildId) {
    return `getGuildPowerStats::${guildId}`;
  }

  /**
   * @param {string} guildId
   * @param {boolean} forceRefresh
   * @return {Promise<GuildPowerStatsDTO>}
   */
  async getGuildPowerStats(guildId, forceRefresh = false) {
    let stats = this.getCachedItem(this.getGuildPowerStatsCacheKey(guildId));
    if (stats === null || forceRefresh) {
      const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/${guildId}/power/stats`);
      const response = this.guildAPIResponseFactory.make(jsonResponse);
      this.handleResponseFailure(response);
      stats = this.guildPowerStatsDTOFactory.make(response.data);
      this.cacheItem(this.getGuildPowerStatsCacheKey(guildId), stats);
    }
    return stats;
  }

  /**
   * @param {string} guildId
   * @return {string}
   */
  countGuildPlanetsCompletedCacheKey(guildId) {
    return `countGuildPlanetsCompleted::${guildId}`;
  }

  /**
   * @return {Promise<number>}
   */
  async countGuildPlanetsCompleted(guildId, forceRefresh = false) {
    let count = this.getCachedItem(this.countGuildPlanetsCompletedCacheKey(guildId));
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/guild/${guildId}/planet/complete/count`, 'count');
      this.cacheItem(this.countGuildPlanetsCompletedCacheKey(guildId), count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} guildId
   * @return {Promise<PlayerSearchResultDTO[]>}
   */
  async getGuildRoster(guildId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/${guildId}/roster`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerSearchResultDTOFactory.parseList(response.data);
  }

  /**
   * @return {string}
   */
  getGuildsDirectoryCacheKey() {
    return `getGuildsDirectory`;
  }

  /**
   * @param {boolean} forceRefresh
   * @return {Promise<GuildSearchResultDTO[]>}
   */
  async getGuildsDirectory(forceRefresh = false) {
    let guilds = this.getCachedItem(this.getGuildsDirectoryCacheKey());
    if (guilds === null || forceRefresh) {
      const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/directory`);
      const response = this.guildAPIResponseFactory.make(jsonResponse);
      this.handleResponseFailure(response);
      guilds = this.guildSearchResultDTOFactory.parseList(response.data);
      this.cacheItem(this.getGuildsDirectoryCacheKey(), guilds);
    }
    return guilds;
  }

  /**
   * @param {string} planetId
   * @return {Promise<PlanetaryShieldInfoDTO>}
   */
  async getPlanetaryShieldInfo(planetId) {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/planet/${planetId}/shield`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.planetaryShieldInfoDTOFactory.make(response.data);
  }

  /**
   * @param {RaidSearchRequestDTO} raidSearchRequestDTO
   * @return {Promise<PlayerSearchResultDTO[]>}
   */
  async raidSearch(raidSearchRequestDTO) {
    const searchStringParam = raidSearchRequestDTO.search_string ? `search_string=${raidSearchRequestDTO.search_string}` : '';
    const guildIdParam = raidSearchRequestDTO.guild_id ? `&guild_id=${raidSearchRequestDTO.guild_id}` : '';
    const minOreParam = `&min_ore=${raidSearchRequestDTO.min_ore}`;
    const fleetAwayOnlyParam = `&fleet_away_only=${raidSearchRequestDTO.fleet_away_only ? 1 : 0}`;
    const pageParam = `&page=${raidSearchRequestDTO.page}`;

    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/raid/search?${searchStringParam}${guildIdParam}${minOreParam}${fleetAwayOnlyParam}${pageParam}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);
    return this.playerSearchResultDTOFactory.parseList(response.data);
  }

  /**
   * @param {RaidSearchRequestDTO} raidSearchRequestDTO
   * @return {Promise<number>}
   */
  async raidSearchCount(raidSearchRequestDTO) {
    const count_only = `count_only=1`;
    const searchStringParam = raidSearchRequestDTO.search_string ? `&search_string=${raidSearchRequestDTO.search_string}` : '';
    const guildIdParam = raidSearchRequestDTO.guild_id ? `&guild_id=${raidSearchRequestDTO.guild_id}` : '';
    const minOreParam = `&min_ore=${raidSearchRequestDTO.min_ore}`;
    const fleetAwayOnlyParam = `&fleet_away_only=${raidSearchRequestDTO.fleet_away_only ? 1 : 0}`;

    const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/raid/search?${count_only}${searchStringParam}${guildIdParam}${minOreParam}${fleetAwayOnlyParam}`);
    const response = this.guildAPIResponseFactory.make(jsonResponse);
    this.handleResponseFailure(response);

    return (response.data.hasOwnProperty('length') && response.data.length === 1 && response.data[0].hasOwnProperty('count'))
      ? parseInt(response.data[0].count)
      : 0;
  }
}