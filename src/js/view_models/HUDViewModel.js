import {AbstractViewModel} from "../framework/AbstractViewModel";
import {StatusBarTopLeftComponent} from "./components/hud/StatusBarTopLeftComponent";
import {StatusBarTopRightComponent} from "./components/hud/StatusBarTopRightComponent";

export class HUDViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super();
    this.gameState = gameState;
    this.topLeftStatusBar = new StatusBarTopLeftComponent(gameState);
    this.topRightStatusBar = new StatusBarTopRightComponent(gameState);
  }

  initPageCode() {
    this.topLeftStatusBar.initPageCode();
    this.topRightStatusBar.initPageCode();
  }

  render() {
    return `
      ${this.topLeftStatusBar.renderHTML()}
      ${this.topRightStatusBar.renderHTML()}
    `;
  }
}
