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
    return structType;
  }

}