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
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerAddressCount(playerId, forceRefresh = false) {
    let count = this.getCachedItem('getPlayerAddressCount');
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player-address/count/player/${playerId}`, 'count');
      this.cacheItem('getPlayerAddressCount', count);
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
   * @param {boolean} forceRefresh
   * @return {Promise<PlayerOreStats>}
   */
  async getPlayerOreStats(playerId, forceRefresh = false) {
    let response = this.getCachedItem('getPlayerOreStats');
    if (response === null || forceRefresh) {
      const jsonResponse = await this.ajax.get(`${this.apiUrl}/player/${playerId}/ore/stats`);
      response = this.guildAPIResponseFactory.make(jsonResponse);
      this.handleResponseFailure(response);
      this.cacheItem('getPlayerOreStats', response);
    }
    return this.playerOreStatsFactory.make(response.data, playerId);
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerPlanetsCompleted(playerId, forceRefresh = false) {
    let count = this.getCachedItem('getPlayerPlanetsCompleted');
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player/${playerId}/planet/completed`, 'count');
      this.cacheItem('getPlayerPlanetsCompleted', count);
    }
    return parseInt(count);
  }

  /**
   * @param {string} playerId
   * @param {boolean} forceRefresh
   * @return {Promise<number>}
   */
  async getPlayerRaidsLaunched(playerId, forceRefresh = false) {
    let count = this.getCachedItem('getPlayerRaidsLaunched');
    if (count === null || forceRefresh) {
      count = await this.getSingleDataValue(`${this.apiUrl}/player/${playerId}/raid/launched`, 'count');
      this.cacheItem('getPlayerRaidsLaunched', count);
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
    Object.assign(info, response.data);

    return info;
  }
}