import {AbstractFactory} from "../framework/AbstractFactory";
import {Struct} from "../models/Struct";
import {legacyToBase, toBase} from "../util/Units";

export class StructFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Struct}
   */
  make(obj) {
    const struct = new Struct();
    Object.assign(struct, obj);
    struct.defending_struct_ids = JSON.parse(obj.defending_struct_ids);

    struct.fuel_p = toBase(obj.fuel_p) ?? legacyToBase(obj.fuel, 6);
    if (struct.fuel_p != null) {
      struct.fuel = Number(struct.fuel_p / 1000000n);
    } else {
      struct.fuel = parseInt(obj.fuel || 0);
    }

    struct.generator_capacity_p = toBase(obj.generator_capacity_p);

    return struct;
  }

}
