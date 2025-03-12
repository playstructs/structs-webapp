import {NotImplementedError} from "./NotImplementedError";

export class AbstractView {
  render() {
    throw new NotImplementedError();
  }
}
