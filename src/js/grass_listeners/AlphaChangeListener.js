import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class AlphaChangeListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('ALPHA_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    const subjectPrefix = `structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`;

    if (
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && ['sent','received','refined'].includes(messageData.category)
      && (messageData.subject === subjectPrefix || messageData.subject.startsWith(`${subjectPrefix}.`))
    ) {
      let amount = parseInt(messageData.amount);

      if (messageData.category === 'sent') {
        amount = -1 * amount;
      }

      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setAlpha(parseInt(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha) + amount);
    }
  }
}