import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";
import {PlanetRaidStatusListener} from "./PlanetRaidStatusListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player
      && messageData.category === 'player_consensus'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
      && messageData.planet_id
    ) {
      this.shouldUnregister = () => true;
      const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;

      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id = messageData.planet_id;

      Promise.all([
        this.guildAPI.getPlanet(messageData.planet_id),
        this.guildAPI.getFleetByPlayerId(playerId),
        this.guildAPI.getStructsByPlayerId(playerId)
      ]).then(([planet, fleet, structs]) => {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanet(planet);
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanetShieldHealth(this.gameState.currentBlockHeight);
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet = fleet;
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.fleet_id = fleet.id;
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setStructs(structs);

        this.grassManager.registerListener(new PlanetRaidStatusListener(
          this.gameState,
          this.guildAPI,
          this.raidManager,
          this.mapManager
        ));
        this.mapManager.configureAlphaBaseMap();
        this.gameState.alphaBaseMap.render();

        MenuPage.router.goto(this.redirectControllerName, this.redirectPageName, this.redirectOptions);
      });
    }
  }
}