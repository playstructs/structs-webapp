import {Infusion} from "../models/Infusion";
import {legacyToBase, toBase} from "../util/Units";

export class InfusionFactory {
  make(obj) {
    const infusion = new Infusion();
    Object.assign(infusion, obj);

    infusion.fuel_p = toBase(obj.fuel_p) ?? legacyToBase(obj.fuel, 6);
    infusion.defusing_p = toBase(obj.defusing_p) ?? legacyToBase(obj.defusing, 6);
    // power is energy (legacy floored W → mW); power_p is already mW.
    infusion.power_p = toBase(obj.power_p) ?? legacyToBase(obj.power, 3);
    infusion.ratio_p = toBase(obj.ratio_p) ?? toBase(obj.ratio);
    // Prefer raw 0–1 commission_p; legacy commission is floor(x*100).
    if (obj.commission_p != null && obj.commission_p !== '') {
      infusion.commission = String(obj.commission_p);
    } else if (obj.commission != null && Number(obj.commission) > 1) {
      // Floored percent integer from the old API.
      infusion.commission = String(Number(obj.commission) / 100);
    }
    infusion.join_infusion_minimum_p = toBase(obj.join_infusion_minimum_p)
      ?? legacyToBase(obj.join_infusion_minimum, 6);
    // defusion_end_height is a block height, not a quantity — leave from assign

    return infusion;
  }
}
