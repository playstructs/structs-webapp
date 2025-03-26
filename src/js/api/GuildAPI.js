import {JsonAjaxer} from "../framework/JsonAjaxer";
import {GuildAPIResponse} from "./GuildAPIResponse";
import {GuildFactory} from "../factories/GuildFactory";

export class GuildAPI {

  constructor() {
    this.apiUrl = '/api';
    this.ajax = new JsonAjaxer();
    this.guildFactory = new GuildFactory();
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
   * @return {Promise<GuildAPIResponse>}
   */
  async getThisGuild() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/this`);
    const response = new GuildAPIResponse(jsonResponse);
    response.data = this.guildFactory.make(response.data);
    return response;
  }

  /**
   * @return {Promise<string>}
   */
  async getTimestamp() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/timestamp`);
    const response = new GuildAPIResponse(jsonResponse);
    return response.data.unix_timestamp;
  }

  /**
   * @param {SignupRequestDTO} signupRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async signup(signupRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/signup`, signupRequestDTO);
    return new GuildAPIResponse(jsonResponse);
  }

  /**
   * @param {LoginRequestDTO} loginRequestDTO
   * @return {GuildAPIResponse}
   */
  async login(loginRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/login`, loginRequestDTO);
    return new GuildAPIResponse(jsonResponse);
  }
}