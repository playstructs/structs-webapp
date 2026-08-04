import {KeyPlayerOreListener} from "../grass_listeners/KeyPlayerOreListener";
import {RaidStatusListener} from "../grass_listeners/RaidStatusListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {KeyPlayerLastActionListener} from "../grass_listeners/KeyPlayerLastActionListener";
import {StructListener} from "../grass_listeners/StructListener";
import {KeyPlayerShieldChangeStatusListener} from "../grass_listeners/KeyPlayerShieldChangeStatusListener";

const RETRY_DELAY_MS = 2000;

export class RaidManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {MapManager} mapManager
   * @param {StructManager} structManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    mapManager,
    structManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.mapManager = mapManager;
    this.structManager = structManager;
  }

  /**
   * Raid data arrives as a fan-out of parallel GETs, so any one of them
   * rejecting used to abort the whole chain and leave the enemy permanently
   * undrawn even though the raid notification had fired. Retrying once degrades
   * that to a delayed render.
   *
   * @param {function(): Promise<void>} load
   * @param {string} description
   * @return {Promise<boolean>} whether the data loaded
   */
  async loadWithRetry(load, description) {
    try {
      await load();
      return true;
    } catch (error) {
      console.warn(`[RaidManager] ${description} failed, retrying:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    try {
      await load();
      return true;
    } catch (error) {
      console.error(`[RaidManager] ${description} failed after retry:`, error);
      return false;
    }
  }

  /**
   * @return {Promise<boolean>}
   */
  async initRaidEnemy() {
    if (!this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()) {
      return true;
    }

    this.grassManager.registerListener(new RaidStatusListener(this.gameState, this, this.mapManager));
    this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.RAID_ENEMY));
    this.grassManager.registerListener(new KeyPlayerOreListener(this.gameState, this.guildAPI, PLAYER_TYPES.RAID_ENEMY));
    this.grassManager.registerListener(new KeyPlayerShieldChangeStatusListener(this.gameState, PLAYER_TYPES.RAID_ENEMY));

    // Register struct status listener for RAID_ENEMY's planet
    this.grassManager.registerListener(new StructListener(
      this.gameState,
      this.guildAPI,
      this.structManager,
      PLAYER_TYPES.RAID_ENEMY
    ));

    return this.loadWithRetry(() => this.loadRaidEnemyData(), 'raid enemy load');
  }

  /**
   * @return {Promise<void>}
   */
  async loadRaidEnemyData() {
    const [
      player,
      height,
      planet,
      shieldInfo,
      raidEnemyFleet,
      playerFleet, // Needs updating as fleet would be away now
      structs,
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getPlanet(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.planet_id),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.planet_id),
      this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id),
      this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id),
      this.guildAPI.getStructsByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id)
    ]);

    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlayer(player);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanet(planet);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet = raidEnemyFleet;
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet = playerFleet;
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setStructs(structs);
  }

  /**
   * @return {Promise<boolean>}
   */
  async initPlanetRaider() {
    if (!this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetRaidInfo.isRaidActive()) {
      return true;
    }

    this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.PLANET_RAIDER));

    return this.loadWithRetry(() => this.loadPlanetRaiderData(), 'planet raider load');
  }

  /**
   * @return {Promise<void>}
   */
  async loadPlanetRaiderData() {
    const [
      player,
      height,
      fleet,
      structs,
      shieldInfo
    ] = await Promise.all([
      this.guildAPI.getPlayer(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getPlayerLastActionBlockHeight(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getStructsByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id),
      this.guildAPI.getPlanetaryShieldInfo(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetRaidInfo.planet_id),
    ]);

    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setPlayer(player);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].fleet = fleet;
    this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].setStructs(structs);
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
  }

  async refreshRaidFleet() {
    this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet = await this.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id);
    this.gameState.raidMap.setDefenderFleet(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet);
  }
}