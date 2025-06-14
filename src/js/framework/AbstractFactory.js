import {NotImplementedError} from "./NotImplementedError";

export class AbstractFactory {

  make(obj) {
    throw new NotImplementedError();
  }

  parseList(list) {
    return list.map(this.make);
  }
}