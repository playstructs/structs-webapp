import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class PlayerOreListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('PLAYER_ORE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    if (
      messageData.category === 'ore'
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
    ) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setOre(messageData.value);

      // Update undiscovered ore count too
      this.guildAPI.getPlanet(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.id).then(planet => {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanet(planet);
      });
    }
  }
}
