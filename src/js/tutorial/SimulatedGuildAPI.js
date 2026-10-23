import {GuildAPI} from "../api/GuildAPI";

/**
 * Guild API for the tutorial. Reads that the real map, HUD and listeners make
 * are answered from the TutorialWorld; nothing goes over the network.
 */
export class SimulatedGuildAPI extends GuildAPI {

  /**
   * @param {TutorialWorld} world
   */
  constructor(world) {
    super();
    this.world = world;
  }

  cacheItem(key, value) {}

  getCachedItem(key, ttl) {
    return null;
  }

  async getSettings() {
    return this.world.getSettings();
  }

  async getThisGuild() {
    return this.world.getGuild();
  }

  async getStructTypes() {
    return this.world.structTypes;
  }

  async getStruct(structId) {
    return this.world.getStruct(structId);
  }

  async getStructsByPlayerId(playerId) {
    return this.world.getStructsByPlayerId(playerId);
  }

  async getPlayer(playerId) {
    return this.world.getPlayer(playerId);
  }

  async getPlayerLastActionBlockHeight(playerId) {
    return 0;
  }

  async getFleetByPlayerId(playerId) {
    return this.world.getFleetByPlayerId(playerId);
  }

  async getPlanet(planetId) {
    return this.world.planet;
  }

  async getPlanetaryShieldInfo(planetId) {
    return this.world.getPlanetaryShieldInfo();
  }

  async getActivePlanetRaidByPlanetId(planetId) {
    return this.world.getPlanetRaid();
  }

  async getActivePlanetRaidByFleetId(fleetId) {
    return this.world.getPlanetRaid();
  }

  async getWorkByPlayerId(playerId) {
    return [];
  }

  async getBannedWords() {
    return [];
  }

  async logout() {}
}
