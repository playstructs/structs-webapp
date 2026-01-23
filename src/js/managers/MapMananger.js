import {PLAYER_MAP_ROLES} from "../constants/PlayerMapRoles";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {HUD_IDS} from "../constants/HUDConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class MapManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  configureAlphaBaseMap() {
    this.gameState.alphaBaseMap.setPlanet(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planet);
    this.gameState.alphaBaseMap.setDefender(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player);
    this.gameState.alphaBaseMap.setDefenderFleet(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet);
    this.gameState.alphaBaseMap.setAttacker(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].player);
    this.gameState.alphaBaseMap.setAttackerFleet(this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].fleet);
    this.gameState.alphaBaseMap.setPlayerMapRole(PLAYER_MAP_ROLES.DEFENDER);
  }

  configureRaidMap() {
    this.gameState.raidMap.setPlanet(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planet);
    this.gameState.raidMap.setDefender(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player);
    this.gameState.raidMap.setDefenderFleet(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].fleet);
    this.gameState.raidMap.setAttacker(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player);
    this.gameState.raidMap.setAttackerFleet(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].fleet);
    this.gameState.raidMap.setPlayerMapRole(PLAYER_MAP_ROLES.ATTACKER);
  }

  /**
   * @param {Planet} planet
   * @param {Player} defender
   * @param {Player} attacker
   * @param {Fleet} defenderFleet
   * @param {Fleet} attackerFleet
   */
  configurePreviewMap(planet, defender, attacker, defenderFleet, attackerFleet) {
    this.gameState.previewMap.setPlanet(planet);
    this.gameState.previewMap.setDefender(defender);
    this.gameState.previewMap.setDefenderFleet(defenderFleet);
    this.gameState.previewMap.setAttacker(attacker);
    this.gameState.previewMap.setAttackerFleet(attackerFleet);
    this.gameState.previewMap.setPlayerMapRole(PLAYER_MAP_ROLES.SPECTATOR);
  }

  hideHUD() {
    Object.values(HUD_IDS).forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
  }

  showHUDForMap(mapContainerId) {
    this.hideHUD();

    if (mapContainerId === MAP_CONTAINER_IDS.RAID) {
      document.getElementById(HUD_IDS.STATUS_BAR_TOP_RIGHT_RAID).classList.remove('hidden');
      document.getElementById(HUD_IDS.ACTION_BAR_RAID_ENEMY).classList.remove('hidden');
    } else if (mapContainerId === MAP_CONTAINER_IDS.ALPHA_BASE) {
      document.getElementById(HUD_IDS.STATUS_BAR_TOP_RIGHT_ALPHA_BASE).classList.remove('hidden');
      if (this.gameState.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].player) {
        document.getElementById(HUD_IDS.ACTION_BAR_ALPHA_BASE_ENEMY).classList.remove('hidden');
      }
    }

    if (
      mapContainerId === MAP_CONTAINER_IDS.ALPHA_BASE
      || mapContainerId === MAP_CONTAINER_IDS.RAID
    ) {
      document.getElementById(HUD_IDS.STATUS_BAR_TOP_LEFT).classList.remove('hidden');
      document.getElementById(HUD_IDS.ACTION_BAR_PLAYER).classList.remove('hidden');
    }
  }

  /**
   * @param {string} mapContainerId
   */
  showMap(mapContainerId) {
    this.showHUDForMap(mapContainerId);

    document.querySelectorAll('.map-container').forEach(mapContainer => {
      mapContainer.classList.add('hidden');
    });
    document.getElementById(mapContainerId).classList.remove('hidden');
  }

  showActiveMap() {
    this.showMap(this.gameState.activeMapContainerId);
  }
}