import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {RAID_STATUS} from "../constants/RaidStatus";
import {RaidStatusUtil} from "../util/RaidStatusUtil";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {NOTIFICATION_DIALOGUE_SEQUENCES} from "../constants/NotificationDialogueSequences";
import {NotificationDialogueSequenceFactory} from "../factories/NotificationDialogueSequenceFactory";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {MenuPage} from "../framework/MenuPage";

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
    this.notificationDialogueSequenceFactory = new NotificationDialogueSequenceFactory();
  }

  raidInitiated(messageData) {
    if (messageData.detail.status !== RAID_STATUS.INITIATED) {
      return;
    }

    console.log('PLANET RAID INITIATED HANDLER');

    this.guildAPI.getActivePlanetRaidByPlanetId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.id).then(raidInfo => {
      this.gameState.setPlanetPlanetRaidInfo(raidInfo, false);

      this.raidManager.initPlanetRaider().then(() => {
        console.log('PLANET RAID ENEMY INITIATED DONE');

        this.mapManager.configureAlphaBaseMap()
        this.gameState.alphaBaseMap.render();
      });
    });
  }

  raidOngoing(messageData) {
    if (messageData.detail.status !== RAID_STATUS.ONGOING) {
      return;
    }

    console.log('PLANET RAID ONGOING HANDLER');

    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanetRaidStatus(messageData.detail.status);
  }

  raidEndActions() {
    this.gameState.clearPlanetRaidData();

    this.mapManager.configureAlphaBaseMap()
    this.gameState.alphaBaseMap.render();

    this.gameState.setActiveMapContainerId(MAP_CONTAINER_IDS.ALPHA_BASE);
    this.mapManager.showMap(MAP_CONTAINER_IDS.ALPHA_BASE);
    MenuPage.router.goto('Fleet', 'index');
    MenuPage.open();

    this.shouldUnregister = () => true;
  }

  raidEnded(messageData) {
    if (!this.raidStatusUtil.hasRaidEnded(messageData.detail.status)) {
      return;
    }

    console.log('PLANET RAID HAS ENDED HANDLER');

    const seizedOre = messageData.detail.seized_ore
      ? messageData.detail.seized_ore
      : 0;

    let dialogue = null;
    if (this.raidStatusUtil.isRaidSuccessful(messageData.detail.status)) {
      dialogue = this.notificationDialogueSequenceFactory.make(
        NOTIFICATION_DIALOGUE_SEQUENCES.DEFEATED_BY_ATTACKER,
        {alphaOreLost: seizedOre}
      );
    } else if (this.raidStatusUtil.isAttackerDefeated(messageData.detail.status)) {
      dialogue = this.notificationDialogueSequenceFactory.make(NOTIFICATION_DIALOGUE_SEQUENCES.DEFENDER_VICTORY);
    }

    if (dialogue) {
      dialogue.actionOnSequenceEnd = () => {
        this.raidEndActions();
      }
      dialogue.start();
    } else {
      this.raidEndActions();
    }
  }

  handler(messageData) {
    if (
      messageData.category === 'raid_status'
      && messageData.subject === `structs.planet.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet.id}`
    ) {
      console.log('PLANET RAID STATUS LISTENER', messageData);

      this.raidInitiated(messageData);
      this.raidOngoing(messageData);
      this.raidEnded(messageData);
    }
  }
}
