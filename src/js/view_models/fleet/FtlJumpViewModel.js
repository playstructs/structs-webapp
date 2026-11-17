import {MenuPage} from "../../framework/MenuPage";
import {TutorialStatusViewModel} from "../tutorial/TutorialStatusViewModel";
import {TUTORIAL_COPY} from "../../tutorial/TutorialCopy";

/** If the raid never starts (e.g. the move failed), don't leave the player stuck here. */
const FTL_JUMP_TIMEOUT_MS = 90 * 1000;

/**
 * "FTL Jump in Progress." shown between Launch Fleet and the raid starting, whether or not
 * a contest is running. The raid's INITIATED status moves the menu on to the Fleet page.
 */
export class FtlJumpViewModel extends TutorialStatusViewModel {

  static timeout = null;

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super(
      'Status',
      TUTORIAL_COPY.FTL_JUMP,
      '/img/tutorial/new-planet-travel.gif',
      'CMD Ship jumping to a new planet',
      true
    );
    this.gameState = gameState;
  }

  /**
   * @return {boolean}
   */
  static isShowing() {
    return MenuPage.router.currentController === 'Fleet' && MenuPage.router.currentPage === 'ftlJump';
  }

  /**
   * Return to the Fleet page if the jump is still on screen.
   */
  static abandon() {
    clearTimeout(FtlJumpViewModel.timeout);
    if (FtlJumpViewModel.isShowing()) {
      MenuPage.router.goto('Fleet', 'index');
    }
  }

  render() {
    super.render();

    clearTimeout(FtlJumpViewModel.timeout);
    FtlJumpViewModel.timeout = setTimeout(() => FtlJumpViewModel.abandon(), FTL_JUMP_TIMEOUT_MS);
  }
}
