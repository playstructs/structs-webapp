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
   * @return {Promise<GuildAPIResponse>}
   */
  async getThisGuild() {
    const jsonResponse = await this.ajax.get(`${this.apiUrl}/guild/this`);
    const response = new GuildAPIResponse(jsonResponse);
    response.data = this.guildFactory.make(response.data);
    return response;
  }

  /**
   * @param {SignupRequestDTO} signupRequestDTO
   * @return {Promise<GuildAPIResponse>}
   */
  async signup(signupRequestDTO) {
    const jsonResponse = await this.ajax.post(`${this.apiUrl}/auth/signup`, signupRequestDTO);
    return new GuildAPIResponse(jsonResponse);
  }
}