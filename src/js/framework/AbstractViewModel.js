import {NotImplementedError} from "./NotImplementedError";

export class AbstractViewModel {
  render() {
    throw new NotImplementedError();
  }
}
