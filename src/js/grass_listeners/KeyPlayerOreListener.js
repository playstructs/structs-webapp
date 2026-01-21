import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class KeyPlayerOreListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} playerType
   */
  constructor(gameState, guildAPI, playerType) {
    super(`${playerType}_ORE`);
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.playerType = playerType;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'ore'
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[this.playerType].id}`
    ) {
      this.gameState.keyPlayers[this.playerType].setOre(messageData.value);

      // Update undiscovered ore count too
      if (this.gameState.keyPlayers[this.playerType].planetUsedForMap) {
        this.guildAPI.getPlanet(this.gameState.keyPlayers[this.playerType].getPlanetId()).then(planet => {
          this.gameState.keyPlayers[this.playerType].setPlanet(planet);
        });
      }
    }

    if (
      this.gameState.keyPlayers[this.playerType].isRaidDependent()
      && messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.getPlanetRaidInfoForKeyPlayer(this.playerType).planet_id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
