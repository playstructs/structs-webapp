import {AbstractFactory} from "../framework/AbstractFactory";
import {PlayerSearchResultDTO} from "../dtos/PlayerSearchResultDTO";

export class PlayerSearchResultDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {PlayerSearchResultDTO}
   */
  make(obj) {
    const player = new PlayerSearchResultDTO();
    Object.assign(player, obj);
    return player;
  }
}