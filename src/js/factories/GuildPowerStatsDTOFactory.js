import {AbstractFactory} from "../framework/AbstractFactory";
import {GuildPowerStatsDTO} from "../dtos/GuildPowerStatsDTO";

export class GuildPowerStatsDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {GuildPowerStatsDTO}
   */
  make(obj) {
    const dto = new GuildPowerStatsDTO();
    Object.assign(dto, obj);
    return dto;
  }
}