import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class RaidEnemyOreListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('RAID_ENEMY_ORE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    if (
      messageData.category === 'ore'
      && messageData.subject === `structs.grid.player.${this.gameState.raidEnemyId}`
    ) {
      this.gameState.setRaidEnemyOre(messageData.value);

      // Update undiscovered ore count too
      this.guildAPI.getPlanet(this.gameState.raidPlanetId).then(planet => {
        this.gameState.setRaidPlanet(planet);
      });
    }

    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.raidPlanetId}`
      && this.raidStatusUtil.hasRaidEnded(messageData.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
