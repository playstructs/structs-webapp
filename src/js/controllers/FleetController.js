import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";
import {ScanResultsViewModel} from "../view_models/fleet/ScanResultsViewModel";
import {MapManager} from "../managers/MapMananger";
import {PreviewViewModel} from "../view_models/fleet/PreviewViewModel";


export class FleetController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {FleetManager} fleetManager
   * @param {RaidManager} raidManager
   * @param {PlanetManager} planetManager
   * @param {MapManager} mapManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    fleetManager,
    raidManager,
    planetManager,
    mapManager
  ) {
    super('Fleet', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.fleetManager = fleetManager;
    this.raidManager = raidManager;
    this.planetManager = planetManager;
    this.mapManager = mapManager;
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
      this.mapManager,
      this.raidManager,
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
      this.mapManager,
      options
    );
    viewModel.render();
  }

  /**
   * @param {Object} options
   */
  preview(options) {
    const viewModel = new PreviewViewModel(
      this.gameState,
      this.guildAPI,
      this.fleetManager,
      this.grassManager,
      this.raidManager,
      this.mapManager,
      options.planet_id,
      options.planet_undiscovered_ore,
      options.defender_id,
      options.defender_ore,
      options.attacker_id
    );
    viewModel.render();
  }
}