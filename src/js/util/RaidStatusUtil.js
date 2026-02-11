import {RAID_STATUS} from "../constants/RaidStatus";

export class RaidStatusUtil {

  /**
   * @param {string} raidStatus
   * @return {boolean}
   */
  hasRaidEnded(raidStatus) {
    return (
      raidStatus === RAID_STATUS.ATTACKER_DEFEATED
      || raidStatus === RAID_STATUS.RAID_SUCCESSFUL
      || raidStatus === RAID_STATUS.DEMILITARIZED
      || raidStatus === RAID_STATUS.ATTACKER_RETREATED
    );
  }

  /**
   * @param {string} raidStatus
   * @return {boolean}
   */
  isAttackerDefeated(raidStatus) {
    return raidStatus === RAID_STATUS.ATTACKER_DEFEATED;
  }

  /**
   * @param {string} raidStatus
   * @return {boolean}
   */
  isRaidSuccessful(raidStatus) {
    return raidStatus === RAID_STATUS.RAID_SUCCESSFUL;
  }
}