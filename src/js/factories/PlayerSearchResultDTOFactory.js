import {AbstractFactory} from "../framework/AbstractFactory";
import {PlayerSearchResultDTO} from "../dtos/PlayerSearchResultDTO";
import {PfpClientRenderAttributes} from "../models/PfpClientRenderAttributes";

export class PlayerSearchResultDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {PlayerSearchResultDTO}
   */
  make(obj) {
    const player = new PlayerSearchResultDTO();
    Object.assign(player, obj);
    player.pfp_client_render_attributes = PfpClientRenderAttributes.fromJson(player.pfp_client_render_attributes);
    return player;
  }
}