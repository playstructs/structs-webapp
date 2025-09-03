import {PLAYER_MAP_ROLES} from "../constants/PlayerMapRoles";

export class MapManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  configureAlphaBase() {
    this.gameState.alphaBaseMap.setPlanet(this.gameState.planet);
    this.gameState.alphaBaseMap.setDefender(this.gameState.thisPlayer);
    this.gameState.alphaBaseMap.setAttacker(this.gameState.planetRaider);
    this.gameState.alphaBaseMap.setPlayerMapRole(PLAYER_MAP_ROLES.DEFENDER);
  }
}