import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";


export class FleetController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager
  ) {
    super('Fleet', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
  }

  index() {
    const viewModel = new FleetIndexViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }
}