import {RaidEnemyLastActionListener} from "../grass_listeners/RaidEnemyLastActionListener";
import {RaidEnemyOreListener} from "../grass_listeners/RaidEnemyOreListener";
import {PlanetRaiderLastActionListener} from "../grass_listeners/PlanetRaiderLastActionListener";
import {RaidStatusListener} from "../grass_listeners/RaidStatusListener";

export class RaidManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
  }

  /**
   * @return {Promise<void>}
   */
  async initRaidEnemy() {
    if (!this.gameState.raidPlanetRaidInfo.isRaidActive()) {
      return;
    }

    this.grassManager.registerListener(new RaidStatusListener(this.gameState, this));
    this.grassManager.registerListener(new RaidEnemyLastActionListener(this.gameState));
    this.grassManager.registerListener(new RaidEnemyOreListener(this.gameState, this.guildAPI));

    const [
      player,
      height,
      planet,
      shieldInfo
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.raidPlanetRaidInfo.planet_owner),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.raidPlanetRaidInfo.planet_owner),
      this.guildAPI.getPlanet(this.gameState.raidPlanetRaidInfo.planet_id),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.raidPlanetRaidInfo.planet_id)
    ]);

    this.gameState.setRaidEnemy(player);
    this.gameState.setRaidEnemyLastActionBlockHeight(height);
    this.gameState.setRaidPlanet(planet);
    this.gameState.setRaidPlanetShieldInfo(shieldInfo);
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
      height
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.planetPlanetRaidInfo.fleet_owner),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.planetPlanetRaidInfo.fleet_owner),
    ]);

    this.gameState.setPlanetRaider(player);
    this.gameState.setPlanetRaiderLastActionBlockHeight(height);
  }
}