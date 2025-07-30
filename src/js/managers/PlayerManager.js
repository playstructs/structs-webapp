import {RaidEnemyLastActionListener} from "../grass_listeners/RaidEnemyLastActionListener";
import {RaidEnemyOreListener} from "../grass_listeners/RaidEnemyOreListener";
import {PlanetRaiderLastActionListener} from "../grass_listeners/PlanetRaiderLastActionListener";

export class PlayerManager {

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
    this.grassManager.registerListener(new RaidEnemyLastActionListener(this.gameState));
    this.grassManager.registerListener(new RaidEnemyOreListener(this.gameState, this.guildAPI));

    const [
      player,
      height,
      planet,
      shieldInfo
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.raidEnemyId),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.raidEnemyId),
      this.guildAPI.getPlanet(this.gameState.raidPlanetId),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.raidPlanetId)
    ]);

    this.gameState.setRaidEnemy(player);
    this.gameState.setRaidEnemyLastActionBlockHeight(height);
    this.gameState.setRaidPlanet(planet);
    this.gameState.setRaidPlanetShieldInfo(shieldInfo);
  }

  /**
   * @param {string} playerId
   * @return {Promise<void>}
   */
  async initPlanetRaider(playerId) {
    this.gameState.setPlanetRaiderId(playerId); // Must be set before registering many GRASS listeners

    this.grassManager.registerListener(new PlanetRaiderLastActionListener(this.gameState));

    const [
      player,
      height
    ] = await Promise.all([
      this.guildAPI.getPlayer(playerId),
      this.guildAPI.getPlayerLastActionBlockHeight(playerId),
    ]);

    this.gameState.setPlanetRaider(player);
    this.gameState.setPlanetRaiderLastActionBlockHeight(height);
  }
}