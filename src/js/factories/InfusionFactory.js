import {Infusion} from "../models/Infusion";

export class InfusionFactory {
  make(obj) {
    const infusion = new Infusion();
    Object.assign(infusion, obj);
    return infusion;
  }
}