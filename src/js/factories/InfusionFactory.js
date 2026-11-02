import {Infusion} from "../models/Infusion";

export class InfusionFactory {
  make(obj, meta = null) {
    const infusion = new Infusion();
    Object.assign(infusion, obj);
    infusion.snapshot_meta = meta ?? infusion.snapshot_meta ?? null;
    return infusion;
  }
}
