import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {TaskSpawnEvent} from "../events/TaskSpawnEvent";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskKillEvent} from "../events/TaskKillEvent";

export class RaidStatusTaskListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
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

      // TODO Makes sure I'm not hashing my own demise

      if (messageData.detail.status === RAID_STATUS.INITIATED) {
        dispatchEvent(new TaskSpawnEvent(new TaskStateFactory().initRaidTask(messageData.detail.fleet_id, messageData.detail.planet_id, this.raidPlanetShieldInfo.block_start_raid, this.raidPlanetShieldInfo.planetary_shield  )));

      } else if (messageData.detail.status === RAID_STATUS.ONGOING) {
        dispatchEvent(new TaskSpawnEvent(new TaskStateFactory().initRaidTask(messageData.detail.fleet_id, messageData.detail.planet_id, this.raidPlanetShieldInfo.block_start_raid, this.raidPlanetShieldInfo.planetary_shield  )));
        console.log('PLANET RAID ONGOING TASK HANDLER');

      } else if (this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {
        dispatchEvent(new TaskKillEvent(messageData.detail.fleet_id));
        this.shouldUnregister = () => true;
      }
    }
  }
}
