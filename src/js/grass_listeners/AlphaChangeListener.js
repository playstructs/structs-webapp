import {AbstractGrassListener} from "../framework/AbstractGrassListener";

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
      this.gameState.thisPlayerId
      && ['sent','received'].includes(messageData.category)
      && messageData.subject.startsWith(`structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`)
    ) {
      let amount = parseInt(messageData.amount);

      if (messageData.category === 'sent') {
        amount = -1 * amount;
      }

      this.gameState.setThisPlayerAlpha(parseInt(this.gameState.thisPlayer.alpha) + amount);
    }
  }
}