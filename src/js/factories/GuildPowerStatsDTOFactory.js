import {AbstractFactory} from "../framework/AbstractFactory";
import {GuildPowerStatsDTO} from "../dtos/GuildPowerStatsDTO";
import {legacyToBase, roundDecimalToBigInt, toBase} from "../util/Units";

export class GuildPowerStatsDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {GuildPowerStatsDTO}
   */
  make(obj) {
    const dto = new GuildPowerStatsDTO();
    Object.assign(dto, obj);

    dto.total_fuel_p = toBase(obj.total_fuel_p) ?? legacyToBase(obj.total_fuel, 6);
    dto.total_load_p = toBase(obj.total_load_p) ?? legacyToBase(obj.total_load, 3);
    dto.total_capacity_p = toBase(obj.total_capacity_p) ?? legacyToBase(obj.total_capacity, 3);
    // avg_connection_capacity_p is a fractional average — round half-up to integer mW.
    dto.avg_connection_capacity_p = roundDecimalToBigInt(obj.avg_connection_capacity_p)
      ?? legacyToBase(obj.avg_connection_capacity, 3);

    return dto;
  }
}
