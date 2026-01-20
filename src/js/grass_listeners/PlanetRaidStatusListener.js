import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class PlanetRaidStatusListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   */
  constructor(
    gameState,
    guildAPI,
    raidManager,
    mapManager
  ) {
    super('PLANET_RAID_STATUS');
    this.gameState = gameState;
    this.guildAPI = gameState.guildAPI;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.raidStatusUtil = new RaidStatusUtil();
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.id}`
    ) {
      console.log('PLANET RAID STATUS LISTENER', messageData);

      if (messageData.detail.status === RAID_STATUS.INITIATED) {

        console.log('PLANET RAID INITIATED HANDLER');

        this.guildAPI.getActivePlanetRaidByPlanetId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.id).then(raidInfo => {
          this.gameState.setPlanetPlanetRaidInfo(raidInfo, false);

          this.raidManager.initPlanetRaider().then(() => {
            console.log('PLANET RAID ENEMY INITIATED DONE');

            this.mapManager.configureAlphaBaseMap()
            this.gameState.alphaBaseMap.render();
          });
        });

      } else if (messageData.detail.status === RAID_STATUS.ONGOING) {

        console.log('PLANET RAID ONGOING HANDLER');

        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanetRaidStatus(messageData.detail.status);

      } else if (this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {

        console.log('PLANET RAID HAS ENDED HANDLER');

        // TODO: Change raid ended handling when map and structs added
        this.gameState.clearPlanetRaidData();

        this.mapManager.configureAlphaBaseMap()
        this.gameState.alphaBaseMap.render();

        this.shouldUnregister = () => true;
      }
    }
  }
}
