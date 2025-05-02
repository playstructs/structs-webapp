import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class FirstPlanetListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('FIRST_PLANET');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    if (
      this.gameState.thisPlayer
      && messageData.category === 'player_consensus'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`
      && messageData.planet_id
    ) {
      this.gameState.thisPlayer.planet_id = messageData.planet_id;
      this.guildAPI.getPlanet(messageData.planet_id).then((planet) => {
        this.gameState.setPlanet(planet);
        console.log(planet);

        MenuPage.router.goto('Auth', 'orientation1');
      });
    }
  }
}