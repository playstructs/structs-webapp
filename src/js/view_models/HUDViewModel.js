import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";
import {ActionBarComponent} from "./components/hud/ActionBarComponent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {MenuPage} from "../framework/MenuPage";
import {HUD_IDS} from "../constants/HUDConstants";

export class HUDViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.topLeftStatusBar = new StatusBarTopLeftComponent(
      gameState,
      HUD_IDS.STATUS_BAR_TOP_LEFT
    );
    this.topRightStatusBarAlphaBase = new StatusBarTopRightComponent(
      gameState,
      false,
      HUD_IDS.STATUS_BAR_TOP_RIGHT_ALPHA_BASE
    );
    this.topRightStatusBarRaid = new StatusBarTopRightComponent(
      gameState,
      true,
      HUD_IDS.STATUS_BAR_TOP_RIGHT_RAID
    );
    this.bottomLeftActionBar = new ActionBarComponent(
      gameState,
      PLAYER_TYPES.PLAYER,
      'left',
      HUD_IDS.ACTION_BAR_PLAYER
    );
    this.bottomLeftActionBar.profileClickHandler = function () {
      const allowedControllers = [
        'Fleet',
        'Guild',
        'Account',
      ];
      if (!allowedControllers.includes(MenuPage.router.currentController)) {
        MenuPage.router.goto('Fleet', 'index');
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
