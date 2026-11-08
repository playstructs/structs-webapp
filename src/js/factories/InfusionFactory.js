import {Infusion} from "../models/Infusion";
import {legacyToBase, toBase} from "../util/Units";

/** [precise field, legacy display field, legacy exponent] */
const EXACT_FIELDS = [
  ['fuel_p', 'fuel', 6],
  ['defusing_p', 'defusing', 6],
  // power is energy (legacy floored W → mW); power_p is already mW.
  ['power_p', 'power', 3],
  ['ratio_p', 'ratio', 0],
  ['join_infusion_minimum_p', 'join_infusion_minimum', 6],
];

export class InfusionFactory {
  make(obj, meta = null) {
    const infusion = new Infusion();
    Object.assign(infusion, obj);
    infusion.snapshot_meta = meta ?? infusion.snapshot_meta ?? null;
    const source = obj ?? {};

    for (const [field, legacy, exponent] of EXACT_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(source, field)) {
        // An explicit null means unknown: never substitute the floored value.
        const exact = toBase(source[field]);
        infusion[field] = exact !== null ? exact.toString() : null;
      } else {
        // Payloads cached before the _p fields existed.
        const exact = legacyToBase(source[legacy], exponent);
        infusion[field] = exact !== null ? exact.toString() : null;
      }
    }

    // Prefer raw 0–1 commission_p; legacy commission is floor(x*100).
    if (source.commission_p != null && source.commission_p !== '') {
      infusion.commission = String(source.commission_p);
    } else if (source.commission != null && Number(source.commission) > 1) {
      infusion.commission = String(Number(source.commission) / 100);
    }
    // defusion_end_height is a block height, not a quantity — leave from assign

    return infusion;
  }
}
