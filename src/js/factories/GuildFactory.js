import {Guild} from "../models/Guild";
import {AbstractFactory} from "../framework/AbstractFactory";
import {SocialsDTOFactory} from "./SocialsDTOFactory";
import {HTTP_PROTOCOL_PATTERN} from "../constants/RegexPattern";

export class GuildFactory extends AbstractFactory {

  constructor() {
    super();
    this.socialsDTOFactory = new SocialsDTOFactory();
  }

  /**
   * @param {object} obj
   * @return {Guild}
   */
  make(obj) {
    const guild = new Guild();
    Object.assign(guild, obj);
    if (guild.hasOwnProperty('socials') && guild.socials !== null) {
      guild.socials = this.socialsDTOFactory.make(JSON.parse(guild.socials));
    }
    if (guild.logo && !HTTP_PROTOCOL_PATTERN.test(guild.logo)) {
      guild.logo = `//${guild.logo}`;
    }
    return guild;
  }
}