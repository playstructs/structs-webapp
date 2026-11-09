import {NotImplementedError} from "./NotImplementedError";

export class AbstractViewModelComponent {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  initPageCode() {
    throw new NotImplementedError();
  }

  renderHTML() {
    throw new NotImplementedError();
  }
}
