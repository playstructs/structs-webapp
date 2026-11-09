import {AbstractFactory} from "../framework/AbstractFactory";
import {PlayerSearchResultDTO} from "../dtos/PlayerSearchResultDTO";
import {PfpClientRenderAttributes} from "../models/PfpClientRenderAttributes";
import {legacyToBase, toBase, toExact} from "../util/Units";

export class PlayerSearchResultDTOFactory extends AbstractFactory {

  /**
   * @param {object} obj
   * @return {PlayerSearchResultDTO}
   */
  make(obj) {
    const player = new PlayerSearchResultDTO();
    Object.assign(player, obj);
    player.pfp_client_render_attributes = PfpClientRenderAttributes.fromJson(player.pfp_client_render_attributes);

    // Unknown funds (alpha and alpha_p both null) stay unknown, never zero.
    player.alpha_p = toExact(toBase(obj.alpha_p) ?? legacyToBase(obj.alpha, 6));
    player.alpha = player.alpha_p != null ? Number(BigInt(player.alpha_p) / 1000000n) : null;

    player.ore_p = toExact(toBase(obj.ore_p) ?? toBase(obj.ore));
    player.ore = player.ore_p != null ? Number(player.ore_p) : null;

    player.undiscovered_ore_p = toExact(toBase(obj.undiscovered_ore_p) ?? toBase(obj.undiscovered_ore));
    player.undiscovered_ore = player.undiscovered_ore_p != null
      ? Number(player.undiscovered_ore_p)
      : null;

    return player;
  }
}
