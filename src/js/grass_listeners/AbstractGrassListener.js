import {NotImplementedError} from "../framework/NotImplementedError";

export class AbstractGrassListener {

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  handler(messageData) {
    throw new NotImplementedError();
  }
  
  shouldUnregister() {
    return false;
  }
}