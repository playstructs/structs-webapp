import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";
import {ActionBarComponent} from "./components/hud/ActionBarComponent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class HUDViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.topLeftStatusBar = new StatusBarTopLeftComponent(gameState);
    this.topRightStatusBar = new StatusBarTopRightComponent(gameState);
    this.bottomLeftActionBar = new ActionBarComponent(
      gameState,
      PLAYER_TYPES.PLAYER,
      'left'
    );
    this.bottomLeftActionBar.profileClickHandler = function () {
      console.log('Open menu');
    };
  }

  initPageCode() {
    this.topLeftStatusBar.initPageCode();
    this.topRightStatusBar.initPageCode();
    this.bottomLeftActionBar.initPageCode();
  }

  render() {
    return `
      ${this.topLeftStatusBar.renderHTML()}
      ${this.topRightStatusBar.renderHTML()}
      ${this.bottomLeftActionBar.renderHTML()}
    `;
  }
}
