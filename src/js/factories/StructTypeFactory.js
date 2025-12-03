import {AbstractFactory} from "../framework/AbstractFactory";
import {StructType} from "../models/StructType";

export class StructTypeFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {StructType}
   */
  make(obj) {
    const structType = new StructType();
    Object.assign(structType, obj);
    structType.possible_ambit_array = JSON.parse(obj.possible_ambit_array);
    structType.primary_weapon_ambits_array = JSON.parse(obj.primary_weapon_ambits_array);
    structType.secondary_weapon_ambits_array = JSON.parse(obj.secondary_weapon_ambits_array);
    return structType;
  }

}