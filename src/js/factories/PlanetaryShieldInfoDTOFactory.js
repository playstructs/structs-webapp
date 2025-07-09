import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {AbstractFactory} from "../framework/AbstractFactory";

export class PlanetaryShieldInfoDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {PlanetaryShieldInfoDTO}
   */
  make(obj) {
    const dto = new PlanetaryShieldInfoDTO();
    Object.assign(dto, obj);
    return dto;
  }
}