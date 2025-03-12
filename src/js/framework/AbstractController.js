export class AbstractController {
  /**
   * @param {string} name
   * @param {GameState} gameState
   */
  constructor(name, gameState) {
    this.name = name;
    this.gameState = gameState;
  }
}