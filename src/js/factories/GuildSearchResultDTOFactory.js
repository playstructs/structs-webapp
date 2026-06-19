import {AbstractFactory} from "../framework/AbstractFactory";
import {GuildSearchResultDTO} from "../dtos/GuildSearchResultDTO";
import {HTTP_PROTOCOL_PATTERN} from "../constants/RegexPattern";

export class GuildSearchResultDTOFactory extends AbstractFactory {
  /**
   * @param {object} obj
   * @return {GuildSearchResultDTO}
   */
  make(obj) {
    const guild = new GuildSearchResultDTO();
    Object.assign(guild, obj);
    if (guild.logo && !HTTP_PROTOCOL_PATTERN.test(guild.logo)) {
      guild.logo = `//${guild.logo}`;
    }
    return guild;
  }
}