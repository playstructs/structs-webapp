import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class AlphaInfusedChangeListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} category
   */
  constructor(gameState, guildAPI, category) {
    super('ALPHA_INFUSED_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.category = category;
  }

  handler(messageData) {
    if (
      messageData.category === this.category
      && messageData.subject.startsWith(`structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`)
    ) {
      this.shouldUnregister = () => true;

      this.guildAPI.getPlayer(this.gameState.thisPlayerId).then(player => {
        this.gameState.setThisPlayer(player); // Refresh alpha count
        MenuPage.router.goto('Guild', 'reactor');
      });

    }
  }
}