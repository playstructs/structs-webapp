import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {PlanetRaidFactory} from "../factories/PlanetRaidFactory";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";

export class RaidStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {RaidManager} raidManager
   */
  constructor(gameState, raidManager) {
    super('RAID_STATUS');
    this.gameState = gameState;
    this.raidManager = raidManager;
    this.raidStatusUtil = new RaidStatusUtil();
    this.planetRaidFactory = new PlanetRaidFactory();
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetRaidInfo.planet_id}`
    ) {
      const planetRaid = this.planetRaidFactory.make(messageData);

      if (planetRaid.status === RAID_STATUS.INITIATED) {
        this.gameState.setRaidPlanetRaidInfo(planetRaid, false);
        this.raidManager.initRaidEnemy().then(() => {
          MenuPage.router.goto('Fleet', 'index', {'raidCardType': PLANET_CARD_TYPES.RAID_STARTED});
        });
      } else {
        this.gameState.setRaidPlanetRaidInfo(planetRaid);
      }

      if (this.raidStatusUtil.hasRaidEnded(messageData.status)) {
        this.shouldUnregister = () => true;
      }
    }
  }
}
