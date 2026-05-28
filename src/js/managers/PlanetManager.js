import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {PlanetNameUtil} from "../util/PlanetNameUtil.js";

export class PlanetManager {

  /**
   * @param {GameState} gameState
   * @param {SigningClientManager} signingClientManager
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, signingClientManager, guildAPI) {
    this.gameState = gameState;
    this.signingClientManager = signingClientManager;
    this.guildAPI = guildAPI;
  }

  async findNewPlanet() {
    const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const bannedWords = await this.guildAPI.getBannedWords();
    const name = PlanetNameUtil.generate(5, bannedWords);

    await this.signingClientManager.queueMsgPlanetExplore(playerId, name);
  }
}
