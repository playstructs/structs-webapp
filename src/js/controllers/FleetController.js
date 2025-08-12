import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";
import {ScanResultsViewModel} from "../view_models/fleet/ScanResultsViewModel";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";


export class FleetController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {FleetManager} fleetManager
   * @param {RaidManager} raidManager
   * @param {PlanetManager} planetManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    fleetManager,
    raidManager,
    planetManager
  ) {
    super('Fleet', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.fleetManager = fleetManager;
    this.raidManager = raidManager;
    this.planetManager = planetManager;
  }

  /**
   * @param {Object} options
   */
  index(options = {}) {

    const planetCardType = options.hasOwnProperty('planetCardType') ? options.planetCardType : null;
    const raidCardType = options.hasOwnProperty('raidCardType') ? options.raidCardType : null;

    const viewModel = new FleetIndexViewModel(
      this.gameState,
      this.guildAPI,
      this.fleetManager,
      this.grassManager,
      this.planetManager,
      planetCardType,
      raidCardType
    );
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
      this.fleetManager,
      this.grassManager,
      this.raidManager,
      options
    );
    viewModel.render();
  }
}