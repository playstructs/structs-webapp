import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {toBase} from "../util/Units";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {TaskCmdAwaitRefineWorkEvent} from "../events/TaskCmdAwaitRefineWorkEvent";

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
      && messageData.subject === `structs.grid.player.${this.gameState.keyPlayers[this.playerType].id}.${this.gameState.keyPlayers[this.playerType].id}`
    ) {
      const keyPlayer = this.gameState.keyPlayers[this.playerType];
      const exactOre = () => toBase(keyPlayer.player?.ore_p) ?? toBase(keyPlayer.player?.ore) ?? 0n;
      const oreBefore = exactOre();

      keyPlayer.setOreP(toBase(messageData.value_p) ?? toBase(messageData.value));

      // Refining stops when the ore runs out, and extracting more doesn't move
      // the refine clock, so nothing else will start the refineries again.
      if (
        this.playerType === PLAYER_TYPES.PLAYER
        && oreBefore === 0n
        && exactOre() > 0n
      ) {
        window.dispatchEvent(new TaskCmdAwaitRefineWorkEvent());
      }

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
      && messageData.subject === `structs.planet.${this.gameState.getPlanetRaidInfoForKeyPlayer(this.playerType).planet_id}.${this.gameState.keyPlayers[this.playerType].id}`
      && this.raidStatusUtil.hasRaidEnded(messageData.detail.status)
    ) {
      this.shouldUnregister = () => true;
    }
  }
}
