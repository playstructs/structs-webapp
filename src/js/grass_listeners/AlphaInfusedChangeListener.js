import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && (messageData.subject.startsWith(`structs.inventory.ualpha.infused.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`)
        || messageData.subject.startsWith(`structs.inventory.ualpha.defusing.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`)
        )
      ) {
      this.shouldUnregister = () => true;

      this.guildAPI.getPlayer(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id).then(player => {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayer(player); // Refresh alpha count
        MenuPage.router.goto('Guild', 'reactor'); // Infusion gets reloaded from Guild controller
      });

    }
  }
}