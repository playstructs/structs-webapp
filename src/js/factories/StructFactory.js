import {AbstractFactory} from "../framework/AbstractFactory";
import {Struct} from "../models/Struct";
import {legacyToBase, toBase} from "../util/Units";
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
    struct.health = parseInt(obj.health || 0);

    // Grid fuel: exact ualpha (decimal string), falling back to legacy grams.
    const gridFuel = toBase(obj.fuel_p) ?? legacyToBase(obj.fuel, 6);
    struct.fuel_p = gridFuel !== null ? gridFuel.toString() : null;
    struct.fuel = gridFuel !== null ? Number(gridFuel / 1000000n) : parseInt(obj.fuel || 0);

    const capacity = toBase(obj.generator_capacity_p);
    struct.generator_capacity_p = capacity !== null ? capacity.toString() : null;

    struct.generator_power = null;
    struct.generator_power_p = null;
    if (Object.prototype.hasOwnProperty.call(obj,'generator_positions_ready')) {
      // Generator totals from its infusion positions supersede the grid value.
      // When positions are incomplete the amount is unknown, never zero.
      struct.generator_snapshot_meta = meta;
      struct.generator_positions_ready = obj.generator_positions_ready === true && meta?.data_ready === true;
      struct.fuel = null;
      struct.fuel_p = null;
      if (struct.generator_positions_ready) {
        const fuel = exactAlphaAmount(obj.generator_fuel_p);
        const power = exactAlphaAmount(obj.generator_power_p);
        struct.fuel_p = fuel.toString();
        struct.fuel = (fuel / 1000000n).toString();
        struct.generator_power_p = power.toString();
        struct.generator_power = (power / 1000n).toString();
      }
    }
    return struct;
  }

}
