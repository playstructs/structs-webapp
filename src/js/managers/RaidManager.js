import {RaidEnemyLastActionListener} from "../grass_listeners/RaidEnemyLastActionListener";
import {RaidEnemyOreListener} from "../grass_listeners/RaidEnemyOreListener";
import {PlanetRaiderLastActionListener} from "../grass_listeners/PlanetRaiderLastActionListener";
import {RaidStatusListener} from "../grass_listeners/RaidStatusListener";

export class RaidManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {MapManager} mapManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    mapManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.mapManager = mapManager;
  }

  /**
   * @return {Promise<void>}
   */
  async initRaidEnemy() {
    if (!this.gameState.raidPlanetRaidInfo.isRaidActive()) {
      return;
    }

    this.grassManager.registerListener(new RaidStatusListener(this.gameState, this, this.mapManager));
    this.grassManager.registerListener(new RaidEnemyLastActionListener(this.gameState));
    this.grassManager.registerListener(new RaidEnemyOreListener(this.gameState, this.guildAPI));

    const [
      player,
      height,
      planet,
      shieldInfo,
      fleet,
      structs,
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.raidPlanetRaidInfo.planet_owner),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.raidPlanetRaidInfo.planet_owner),
      this.guildAPI.getPlanet(this.gameState.raidPlanetRaidInfo.planet_id),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.raidPlanetRaidInfo.planet_id),
      this.guildAPI.getFleetByPlayerId(this.gameState.raidPlanetRaidInfo.planet_owner),
      this.guildAPI.getStructsByPlayerId(this.gameState.raidPlanetRaidInfo.planet_owner)
    ]);

    this.gameState.setRaidEnemy(player);
    this.gameState.setRaidEnemyLastActionBlockHeight(height);
    this.gameState.setRaidPlanet(planet);
    this.gameState.setRaidPlanetShieldInfo(shieldInfo);
    this.gameState.setRaidEnemyFleet(fleet);
    this.gameState.setRaidEnemyStructs(structs);
  }

  /**
   * @return {Promise<void>}
   */
  async initPlanetRaider() {
    if (!this.gameState.planetPlanetRaidInfo.isRaidActive()) {
      return;
    }

    this.grassManager.registerListener(new PlanetRaiderLastActionListener(this.gameState));

    const [
      player,
      height,
      fleet,
      structs
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.planetPlanetRaidInfo.fleet_owner),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.planetPlanetRaidInfo.fleet_owner),
      this.guildAPI.getFleetByPlayerId(this.gameState.planetPlanetRaidInfo.fleet_owner),
      this.guildAPI.getStructsByPlayerId(this.gameState.planetPlanetRaidInfo.fleet_owner)
    ]);

    this.gameState.setPlanetRaider(player);
    this.gameState.setPlanetRaiderLastActionBlockHeight(height);
    this.gameState.setPlanetRaiderFleet(fleet);
    this.gameState.setPlanetRaiderStructs(structs);
  }
}