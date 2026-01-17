import {RaidEnemyLastActionListener} from "../grass_listeners/RaidEnemyLastActionListener";
import {RaidEnemyOreListener} from "../grass_listeners/RaidEnemyOreListener";
import {PlanetRaiderLastActionListener} from "../grass_listeners/PlanetRaiderLastActionListener";
import {RaidStatusListener} from "../grass_listeners/RaidStatusListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
    if (!this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()) {
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
      this.guildAPI.getPlayer(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getPlanet(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.planet_id),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.planet_id),
      this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getStructsByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id)
    ]);

    this.gameState.setRaidEnemy(player);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.setRaidPlanet(planet);
    this.gameState.setRaidPlanetShieldInfo(shieldInfo);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet = fleet;
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setStructs(structs);
  }

  /**
   * @return {Promise<void>}
   */
  async initPlanetRaider() {
    if (!this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo.isRaidActive()) {
      return;
    }

    this.grassManager.registerListener(new PlanetRaiderLastActionListener(this.gameState));

    const [
      player,
      height,
      fleet,
      structs
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getStructsByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id)
    ]);

    this.gameState.setPlanetRaider(player);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].fleet = fleet;
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setStructs(structs);
  }
}