import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";
import {PlanetRaidStatusListener} from "./PlanetRaidStatusListener";

export class NewPlanetListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {MapManager} mapManager
   * @param {GrassManager} grassManager
   * @param {RaidManager} raidManager
   */
  constructor(
    gameState,
    guildAPI,
    mapManager,
    grassManager,
    raidManager
  ) {
    super('NEW_PLANET');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.mapManager = mapManager;
    this.grassManager = grassManager;
    this.raidManager = raidManager;
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
        this.grassManager.registerListener(new PlanetRaidStatusListener(
          this.gameState,
          this.guildAPI,
          this.raidManager,
          this.mapManager
        ));
        this.mapManager.configureAlphaBase();
        this.gameState.alphaBaseMap.render();

        MenuPage.router.goto(this.redirectControllerName, this.redirectPageName, this.redirectOptions);
      });
    }
  }
}