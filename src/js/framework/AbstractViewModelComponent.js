import {NotImplementedError} from "./NotImplementedError";
import {NumberFormatter} from "../util/NumberFormatter";

export class AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.numberFormatter = new NumberFormatter();
  }

  initPageCode() {
    throw new NotImplementedError();
  }

  renderHTML() {
    throw new NotImplementedError();
  }
}
