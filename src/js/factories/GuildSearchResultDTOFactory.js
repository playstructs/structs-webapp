import {AbstractFactory} from "../framework/AbstractFactory";
import {GuildSearchResultDTO} from "../dtos/GuildSearchResultDTO";

export class GuildSearchResultDTOFactory extends AbstractFactory {
  /**
   * @param {object} obj
   * @return {GuildSearchResultDTO}
   */
  make(obj) {
    const guild = new GuildSearchResultDTO();
    Object.assign(guild, obj);
    return guild;
  }
}