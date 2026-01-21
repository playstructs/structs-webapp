import {KeyPlayerOreListener} from "../grass_listeners/KeyPlayerOreListener";
import {RaidStatusListener} from "../grass_listeners/RaidStatusListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {KeyPlayerLastActionListener} from "../grass_listeners/KeyPlayerLastActionListener";

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
    this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.RAID_ENEMY));
    this.grassManager.registerListener(new KeyPlayerOreListener(this.gameState, this.guildAPI, PLAYER_TYPES.RAID_ENEMY));

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

    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlayer(player);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanet(planet);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet = fleet;
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setStructs(structs);
  }

  /**
   * @return {Promise<void>}
   */
  async initPlanetRaider() {
    if (!this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetRaidInfo.isRaidActive()) {
      return;
    }

    this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.PLANET_RAIDER));

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

    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setPlayer(player);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].fleet = fleet;
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setStructs(structs);
  }
}