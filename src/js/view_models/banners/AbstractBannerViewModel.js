import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NotImplementedError} from "../../framework/NotImplementedError";

export class AbstractBannerViewModel extends AbstractViewModel {

  constructor() {
    super();
    this.id = '';
    this.banner = null;
    this.isLoaded = false;
  }

  close() {
    throw new NotImplementedError();
  }

}