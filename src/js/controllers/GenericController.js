import {AbstractController} from "../framework/AbstractController";
import {MenuWaitingViewModel} from "../view_models/generic/MenuWaitingViewModel";
import {MenuWaitingOptions} from "../options/MenuWaitingOptions";

export class GenericController extends AbstractController {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('Generic', gameState);
  }

  /**
   * @param {MenuWaitingOptions} options
   */
  menuWaiting(options) {
    const viewModel = new MenuWaitingViewModel(options);
    viewModel.render();
  }

}