import {AbstractFactory} from "../framework/AbstractFactory";
import {StructType} from "../models/StructType";
import {legacyToBase, toBase} from "../util/Units";

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

    structType.build_draw_p = toBase(obj.build_draw_p) ?? legacyToBase(obj.build_draw, 3);
    structType.passive_draw_p = toBase(obj.passive_draw_p) ?? legacyToBase(obj.passive_draw, 3);

    // generating_rate_p is mW/ualpha; legacy generating_rate is generating_rate_p × 1000 (W/g).
    structType.generating_rate_p = toBase(obj.generating_rate_p)
      ?? (toBase(obj.generating_rate) != null ? toBase(obj.generating_rate) / 1000n : null);
    structType.generating_rate = parseInt(obj.generating_rate || 0);

    return structType;
  }

}
