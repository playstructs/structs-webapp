import {AbstractController} from "../framework/AbstractController";
import {AccountIndexView} from "../view_models/account/AccountIndexViewModel";

export class AccountController extends AbstractController {

  /**
   * @param {GameState} gameState
   */
  constructor(
    gameState
  ) {
    super('Account', gameState);
  }

  index() {
    const viewModel = new AccountIndexView(this.gameState);
    viewModel.render();
  }
}