import {AbstractFactory} from "../framework/AbstractFactory";
import {Struct} from "../models/Struct";
import {exactAlphaAmount} from "../util/ReactorIntent";

export class StructFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Struct}
   */
  make(obj, meta = null) {
    const struct = new Struct();
    Object.assign(struct, obj);
    struct.defending_struct_ids = JSON.parse(obj.defending_struct_ids);
    struct.fuel = parseInt(obj.fuel || 0);
    struct.generator_power = null;
    if (Object.prototype.hasOwnProperty.call(obj,'generator_positions_ready')) {
      struct.generator_snapshot_meta = meta;
      struct.generator_positions_ready = obj.generator_positions_ready === true && meta?.data_ready === true;
      struct.fuel = null;
      if (struct.generator_positions_ready) {
        struct.fuel = (exactAlphaAmount(obj.generator_fuel_p)/1000000n).toString();
        struct.generator_power = (exactAlphaAmount(obj.generator_power_p)/1000n).toString();
      }
    }
    return struct;
  }

}
