import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";
import {ActionBarComponent} from "./components/hud/ActionBarComponent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {MenuPage} from "../framework/MenuPage";
import {STATUS_BAR_TOP_RIGHT_IDS} from "../constants/StatusBarTopRightConstants";

export class HUDViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.topLeftStatusBar = new StatusBarTopLeftComponent(gameState);
    this.topRightStatusBarAlphaBase = new StatusBarTopRightComponent(
      gameState,
      false,
      STATUS_BAR_TOP_RIGHT_IDS.ALPHA_BASE
    );
    this.topRightStatusBarRaid = new StatusBarTopRightComponent(
      gameState,
      true,
      STATUS_BAR_TOP_RIGHT_IDS.RAID
    );
    this.bottomLeftActionBar = new ActionBarComponent(
      gameState,
      PLAYER_TYPES.PLAYER,
      'left'
    );
    this.bottomLeftActionBar.profileClickHandler = function () {
      const allowedControllers = [
        'Fleet',
        'Guild',
        'Account',
      ];
      if (!allowedControllers.includes(MenuPage.router.currentController)) {
        MenuPage.router.goto('Account', 'index');
      } else {
        MenuPage.router.goto(MenuPage.router.currentController, MenuPage.router.currentPage, MenuPage.router.currentOptions);
      }
      MenuPage.open();
    };
  }

  initPageCode() {
    this.topLeftStatusBar.initPageCode();
    this.topRightStatusBarAlphaBase.initPageCode();
    this.topRightStatusBarRaid.initPageCode();
    this.bottomLeftActionBar.initPageCode();
  }

  render() {
    return `
      ${this.topLeftStatusBar.renderHTML()}
      ${this.topRightStatusBarAlphaBase.renderHTML()}
      ${this.topRightStatusBarRaid.renderHTML()}
      ${this.bottomLeftActionBar.renderHTML()}
    `;
  }
}
