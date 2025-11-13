import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {TaskSpawnEvent} from "../events/TaskSpawnEvent";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskKillEvent} from "../events/TaskKillEvent";

export class RaidStatusTaskListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   */
  constructor(
    gameState,
  ) {
    super('RAID_STATUS_TASK');
    this.gameState = gameState;
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetRaidInfo.planet_id}`
    ) {
      console.log('PLANET RAID STATUS TASK LISTENER', messageData);

      if (messageData.detail.status === RAID_STATUS.INITIATED) {
        // TODO Makes sure I'm not hashing my own demise
        // TODO we need this proper block. Guessing with current block height will have errors.
        // TODO get the correct difficulty
        dispatchEvent(new TaskSpawnEvent(new TaskStateFactory().initRaidTask(messageData.detail.fleet_id, messageData.detail.planet_id, gameState.currentBlockHeight, 1500  )));

      } else if (messageData.detail.status === RAID_STATUS.ONGOING) {

        // TODO Did the planet shield value change? We should reload the task process
        console.log('PLANET RAID ONGOING TASK HANDLER');

      } else if (this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {
        dispatchEvent(new TaskKillEvent(messageData.detail.fleet_id));
        this.shouldUnregister = () => true;
      }
    }
  }
}
