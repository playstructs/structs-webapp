import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";

export class RaidEnemyOreListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('RAID_ENEMY_ORE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'ore'
      && messageData.subject === `structs.grid.player.${this.gameState.raidPlanetRaidInfo.planet_id}`
    ) {
      this.gameState.setRaidEnemyOre(messageData.value);

      // Update undiscovered ore count too
      this.guildAPI.getPlanet(this.gameState.raidPlanetRaidInfo.planet_id).then(planet => {
        this.gameState.setRaidPlanet(planet);
      });
    }

    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetRaidInfo.planet_id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
