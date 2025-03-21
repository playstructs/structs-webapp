import {Guild} from "../models/Guild";

export class GuildFactory {
  make(obj) {
    const guild = new Guild();
    Object.assign(guild, obj);
    return guild;
  }
}