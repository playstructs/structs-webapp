import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";


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

  scan() {
    const viewModel = new ScanViewModel(this.gameState, this.guildAPI);
    viewModel.render();
  }
}