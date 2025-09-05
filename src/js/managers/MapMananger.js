import {PLAYER_MAP_ROLES} from "../constants/PlayerMapRoles";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {STATUS_BAR_TOP_RIGHT_IDS} from "../constants/StatusBarTopRightConstants";

export class MapManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  configureAlphaBaseMap() {
    this.gameState.alphaBaseMap.setPlanet(this.gameState.planet);
    this.gameState.alphaBaseMap.setDefender(this.gameState.thisPlayer);
    this.gameState.alphaBaseMap.setAttacker(this.gameState.planetRaider);
    this.gameState.alphaBaseMap.setPlayerMapRole(PLAYER_MAP_ROLES.DEFENDER);
  }

  configureRaidMap() {
    this.gameState.raidMap.setPlanet(this.gameState.raidPlanet);
    this.gameState.raidMap.setDefender(this.gameState.raidEnemy);
    this.gameState.raidMap.setAttacker(this.gameState.thisPlayer);
    this.gameState.raidMap.setPlayerMapRole(PLAYER_MAP_ROLES.ATTACKER);
  }

  /**
   * @param {string} mapContainerId
   */
  showMap(mapContainerId) {
    document.querySelectorAll('.status-bar-panel-top-right').forEach(panel => {
      panel.classList.add('hidden');
    });
    if (mapContainerId === MAP_CONTAINER_IDS.RAID) {
      document.getElementById(STATUS_BAR_TOP_RIGHT_IDS.RAID).classList.remove('hidden');
    } else {
      document.getElementById(STATUS_BAR_TOP_RIGHT_IDS.ALPHA_BASE).classList.remove('hidden');
    }

    document.querySelectorAll('.map-container').forEach(mapContainer => {
      mapContainer.classList.add('hidden');
    });
    document.getElementById(mapContainerId).classList.remove('hidden');
  }

  showActiveMap() {
    this.showMap(this.gameState.activeMapContainerId);
  }
}