import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerOreListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('PLAYER_ORE');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'ore'
      && messageData.subject === `structs.grid.player.${this.gameState.thisPlayerId}`
    ) {
      this.gameState.setThisPlayerOre(messageData.value);
    }
  }
}
