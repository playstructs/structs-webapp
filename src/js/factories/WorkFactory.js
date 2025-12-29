import {AbstractFactory} from "../framework/AbstractFactory";
import {Work} from "../models/Work";

export class WorkFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Work}
   */
  make(obj) {
    const work = new Work();
    Object.assign(work, obj);
    return work;
  }

}