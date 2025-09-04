import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";

export class RaidStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   */
  constructor(
    gameState,
    raidManager,
    mapManager
  ) {
    super('RAID_STATUS');
    this.gameState = gameState;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.raidPlanetRaidInfo.planet_id}`
    ) {
      console.log('RAID STATUS LISTENER', messageData);

      if (messageData.detail.status === RAID_STATUS.INITIATED) {

        console.log('RAID INITIATED HANDLER');

        // Don't dispatch as we need to wait for the raid enemy info
        this.gameState.setRaidPlanetRaidStatus(messageData.detail.status, false);

        this.raidManager.initRaidEnemy().then(() => {
          console.log('RAID ENEMY INITIATED DONE');

          this.mapManager.configureRaidMap();
          this.gameState.raidMap.render();

          MenuPage.router.goto('Fleet', 'index', {'raidCardType': PLANET_CARD_TYPES.RAID_STARTED});
        });

      } else if (messageData.detail.status === RAID_STATUS.ONGOING) {

        console.log('RAID ONGOING HANDLER');

        this.gameState.setRaidPlanetRaidStatus(messageData.detail.status);

      } else if (this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {

        console.log('RAID HAS ENDED HANDLER');

        // Clear the planet raid info
        // TODO: Change raid ended handling when map and structs added
        this.gameState.clearRaidData();

        this.mapManager.configureRaidMap();
        this.gameState.raidMap.render();

        this.shouldUnregister = () => true;
      }
    }
  }
}
