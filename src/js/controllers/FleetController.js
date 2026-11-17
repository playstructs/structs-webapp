import {AbstractController} from "../framework/AbstractController";
import {FleetIndexViewModel} from "../view_models/fleet/FleetIndexViewModel";
import {ScanViewModel} from "../view_models/fleet/ScanViewModel";
import {ScanResultsViewModel} from "../view_models/fleet/ScanResultsViewModel";
import {MapManager} from "../managers/MapMananger";
import {PreviewViewModel} from "../view_models/fleet/PreviewViewModel";
import {EventRulesViewModel} from "../view_models/fleet/EventRulesViewModel";
import {SectorLeaderboardViewModel} from "../view_models/fleet/SectorLeaderboardViewModel";
import {SectorMapViewModel} from "../view_models/fleet/SectorMapViewModel";
import {FtlJumpViewModel} from "../view_models/fleet/FtlJumpViewModel";


export class FleetController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {GrassManager} grassManager
   * @param {FleetManager} fleetManager
   * @param {RaidManager} raidManager
   * @param {PlanetManager} planetManager
   * @param {MapManager} mapManager
   * @param {StructManager} structManager
   * @param {InfluenceAPI} influenceAPI
   * @param {SectorBlitzManager} sectorBlitzManager
   */
  constructor(
    gameState,
    guildAPI,
    grassManager,
    fleetManager,
    raidManager,
    planetManager,
    mapManager,
    structManager,
    influenceAPI,
    sectorBlitzManager
  ) {
    super('Fleet', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.fleetManager = fleetManager;
    this.raidManager = raidManager;
    this.planetManager = planetManager;
    this.mapManager = mapManager;
    this.structManager = structManager;
    this.influenceAPI = influenceAPI;
    this.sectorBlitzManager = sectorBlitzManager;
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
      this.structManager,
      planetCardType,
      raidCardType,
      this.influenceAPI,
      this.sectorBlitzManager
    );
    viewModel.render();
  }

  /**
   * @param {RaidSearchRequestDTO|object|null} options the search to restore, if any
   */
  scan(options = null) {
    const viewModel = new ScanViewModel(this.gameState, this.guildAPI, options, this.sectorBlitzManager);
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

  eventRules() {
    const viewModel = new EventRulesViewModel(this.gameState, this.sectorBlitzManager);
    viewModel.render();
  }

  /**
   * @param {object} options {sector, guildPage, playerPage}
   */
  sectorLeaderboard(options = {}) {
    const viewModel = new SectorLeaderboardViewModel(
      this.gameState,
      this.guildAPI,
      this.influenceAPI,
      this.sectorBlitzManager,
      options
    );
    viewModel.render();
  }

  /**
   * @param {object} options {sector} to preselect
   */
  sectorMap(options = {}) {
    const viewModel = new SectorMapViewModel(this.gameState, this.influenceAPI, this.sectorBlitzManager, options);
    viewModel.render();
  }

  /**
   * Shown while a launched fleet makes its FTL jump to the raid target.
   */
  ftlJump() {
    const viewModel = new FtlJumpViewModel(this.gameState);
    viewModel.render();
  }
}
