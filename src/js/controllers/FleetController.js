import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";
import {ScanResultsViewModel} from "../view_models/fleet/ScanResultsViewModel";


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

  /**
   * @param {Object} options
   */
  scanResults(options) {
    const viewModel = new ScanResultsViewModel(
      this.gameState,
      this.guildAPI,
      options
    );
    viewModel.render();
  }
}