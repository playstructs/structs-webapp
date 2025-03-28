import {NotImplementedError} from "./NotImplementedError";

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