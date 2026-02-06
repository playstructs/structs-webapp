import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {MenuPage} from "../framework/MenuPage";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.planet_id}`
    ) {
      console.log('RAID STATUS LISTENER', messageData);

      if (messageData.detail.status === RAID_STATUS.INITIATED) {

        console.log('RAID INITIATED HANDLER');

        // Don't dispatch as we need to wait for the raid enemy info
        this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanetRaidStatus(messageData.detail.status, false);

        this.raidManager.initRaidEnemy().then(() => {
          console.log('RAID ENEMY INITIATED DONE');

          window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initRaidTask(messageData.detail.fleet_id, messageData.detail.planet_id, this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.block_start_raid, this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.planetary_shield  )));

          // Also needs updating as the fleet has moved away
          this.mapManager.configureAlphaBaseMap();
          this.gameState.alphaBaseMap.render();

          this.mapManager.configureRaidMap();
          this.gameState.raidMap.render();

          MenuPage.router.goto('Fleet', 'index', {'raidCardType': PLANET_CARD_TYPES.RAID_STARTED});
        });

      } else if (messageData.detail.status === RAID_STATUS.ONGOING) {

        console.log('RAID ONGOING HANDLER');

        this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].setPlanetRaidStatus(messageData.detail.status);

        window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initRaidTask(messageData.detail.fleet_id, messageData.detail.planet_id, this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.block_start_raid, this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.planetary_shield  )));

      } else if (this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {

        console.log('RAID HAS ENDED HANDLER');

        // Player's fleet needs updating as it's been moved back home.
        this.gameState.guildAPI.getFleetByPlayerId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id).then(playerFleet => {

          this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet = playerFleet;

          window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.fleet_id));

          // Clear the planet raid info
          this.gameState.clearRaidData();

          this.mapManager.configureRaidMap();
          this.gameState.raidMap.render();

          this.mapManager.configureAlphaBaseMap();
          this.gameState.alphaBaseMap.render();

          this.shouldUnregister = () => true;

        });
      }
    }

    /**
     * Handles the special case where the player is raiding a planet
     * and the raid enemy's fleet leaves or arrives during the battle.
     */
    if (
      (messageData.category === 'fleet_depart' || messageData.category === 'fleet_arrive')
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].getPlanetId()}`
      && this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].isFleetOwner(messageData.detail?.fleet_id)
    ) {
      this.raidManager.refreshRaidFleet().then(() => {
        this.gameState.raidMap.render();
      })
    }
  }
}
