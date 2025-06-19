import {AbstractFactory} from "../framework/AbstractFactory";
import {SocialsDTO} from "../dtos/SocialsDTO";
import {DISCORD_URL_PATTERN} from "../constants/RegexPattern";

export class SocialsDTOFactory extends AbstractFactory {

  /**
   * @param {string} url
   * @return {string}
   */
  filterDiscordUrl(url) {
    if (DISCORD_URL_PATTERN.test(url)) {
      return `https://discord.gg/${url.match(DISCORD_URL_PATTERN)[0]}`;
    }
    return "";
  }

  /**
   * @param {object} obj
   * @return {SocialsDTO}
   */
  make(obj) {
    const dto = new SocialsDTO();
    Object.assign(dto, obj);

    dto.discord_server = this.filterDiscordUrl(dto.discord_server);

    return dto;
  }
}