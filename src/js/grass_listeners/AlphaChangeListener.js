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
    if (
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && ['sent','received'].includes(messageData.category)
      && messageData.subject.startsWith(`structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`)
    ) {
      let amount = parseInt(messageData.amount);

      if (messageData.category === 'sent') {
        amount = -1 * amount;
      }

      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setAlpha(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.alpha + amount);
    }
  }
}