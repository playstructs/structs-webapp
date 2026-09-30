import {AbstractFactory} from "../framework/AbstractFactory";
import {GuildSearchResultDTO} from "../dtos/GuildSearchResultDTO";
import {HTTP_PROTOCOL_PATTERN} from "../constants/RegexPattern";
import {legacyToBase, toBase} from "../util/Units";

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

    guild.alpha_p = toBase(obj.alpha_p) ?? legacyToBase(obj.alpha, 6);
    if (guild.alpha_p != null) {
      guild.alpha = Number(guild.alpha_p / 1000000n);
    }

    return guild;
  }
}
