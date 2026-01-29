import {AbstractFactory} from "../framework/AbstractFactory";
import {Struct} from "../models/Struct";

export class StructFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {Struct}
   */
  make(obj) {
    const struct = new Struct();
    Object.assign(struct, obj);
    struct.defending_struct_ids = JSON.parse(obj.defending_struct_ids);
    return struct;
  }

}