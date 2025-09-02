import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";

export class NewPlanetListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {MapManager} mapManager
   */
  constructor(gameState, guildAPI, mapManager) {
    super('NEW_PLANET');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.mapManager = mapManager;
    this.redirectControllerName = 'Fleet';
    this.redirectPageName = 'index';
    this.redirectOptions = {planetCardType: PLANET_CARD_TYPES.ALPHA_BASE_ARRIVED};
  }

  handler(messageData) {
    if (
      this.gameState.thisPlayer
      && messageData.category === 'player_consensus'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}`
      && messageData.planet_id
    ) {
      this.shouldUnregister = () => true;

      this.gameState.thisPlayer.planet_id = messageData.planet_id;
      this.guildAPI.getPlanet(messageData.planet_id).then((planet) => {
        this.gameState.setPlanet(planet);
        this.gameState.setPlanetShieldHealth(100);
        this.mapManager.configureAlphaBase();
        this.gameState.alphaBaseMap.render();

        MenuPage.router.goto(this.redirectControllerName, this.redirectPageName, this.redirectOptions);
      });
    }
  }
}