import {JsonAjaxer} from "../framework/JsonAjaxer";
import {GuildFactory} from "../factories/GuildFactory";
import {PlayerFactory} from "../factories/PlayerFactory";
import {GuildAPIResponseFactory} from "../factories/GuildAPIResponseFactory";
import {GuildAPIError} from "../errors/GuildAPIError";

export class GuildAPI {

  constructor() {
    this.apiUrl = '/api';
    this.ajax = new JsonAjaxer();
    this.guildAPIResponseFactory = new GuildAPIResponseFactory();
    this.guildFactory = new GuildFactory();
    this.playerFactory = new PlayerFactory();
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
}