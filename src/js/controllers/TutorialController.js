import {AbstractController} from "../framework/AbstractController";
import {MenuPage} from "../framework/MenuPage";
import {TutorialStatusViewModel} from "../view_models/tutorial/TutorialStatusViewModel";
import {HRBotTalkingTemplate} from "../view_models/templates/HRBotTalkingTemplate";
import {TutorialDirector} from "../tutorial/TutorialDirector";
import {TutorialMode} from "../tutorial/TutorialMode";
import {TUTORIAL_COPY} from "../tutorial/TutorialCopy";
import {StructListener} from "../grass_listeners/StructListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {onboardingTelemetry} from "../telemetry/OnboardingTelemetry";
import {TutorialMenuViewModel} from "../view_models/tutorial/TutorialMenuViewModel";
import {TutorialConfirmViewModel} from "../view_models/tutorial/TutorialConfirmViewModel";

/** How long the "Simulation loading..." screen shows before the simulation starts. */
const LOADING_SCREEN_MS = 3000;

/** How long the FTL jump screen shows before handing back to the real game. */
const FTL_SCREEN_MS = 3500;

/**
 * Combat Training: a simulated raid on a training Alpha Base, run on the real
 * map and HUD (see TutorialWorld and TutorialDirector).
 */
export class TutorialController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {TutorialWorld} world
   * @param {SimulatedSigningClientManager} signingClientManager
   * @param {SimulatedGuildAPI} guildAPI
   * @param {StructManager} structManager
   * @param {MapManager} mapManager
   * @param {DestroyedStructManager} destroyedStructManager
   */
  constructor(
    gameState,
    world,
    signingClientManager,
    guildAPI,
    structManager,
    mapManager,
    destroyedStructManager
  ) {
    super('Tutorial', gameState);
    this.world = world;
    this.signingClientManager = signingClientManager;
    this.guildAPI = guildAPI;
    this.structManager = structManager;
    this.mapManager = mapManager;
    this.destroyedStructManager = destroyedStructManager;
  }

  loading() {
    const viewModel = new TutorialStatusViewModel('Loading...', TUTORIAL_COPY.SIMULATION_LOADING);
    viewModel.render();

    setTimeout(() => this.startSimulation(), LOADING_SCREEN_MS);
  }

  rerenderMap() {
    this.mapManager.configureAlphaBaseMap();
    this.gameState.alphaBaseMap.render();
    this.mapManager.showActiveMap();
  }

  startSimulation() {
    this.world.attach(
      this.gameState,
      new StructListener(this.gameState, this.guildAPI, this.structManager, PLAYER_TYPES.PLAYER)
    );

    // The tutorial's power figures are illustrative, so they never block a deploy.
    this.structManager.getDeploymentBlockerInsufficientEnergySupply = () => '';

    this.destroyedStructManager.init();
    this.gameState.activeMapContainerId = MAP_CONTAINER_IDS.ALPHA_BASE;
    this.world.loadPlayerIntoGameState();
    this.world.startBlocks();

    this.rerenderMap();

    MenuPage.hideAndClearDialoguePanel();
    MenuPage.close();

    const director = new TutorialDirector(
      this.gameState,
      this.world,
      this.signingClientManager,
      () => this.rerenderMap(),
      (structId) => this.sweepWreck(structId),
      () => this.finishSimulation()
    );
    director.start();
  }

  /**
   * Clears destroyed structs now instead of waiting for the sweep delay.
   * Only safe once their destruction animations have finished.
   *
   * @param {string|null} structId null clears every wreck
   */
  sweepWreck(structId = null) {
    Object.keys(this.destroyedStructManager.destroyedStructs).forEach(id => {
      if (structId === null || id === structId) {
        this.destroyedStructManager.destroyedStructs[id].struct.destroyed_block = 0;
      }
    });
    this.destroyedStructManager.sweep();

    // With the wreck gone, survivors drop the defense icons it was part of.
    const mapType = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].planetMapType;
    this.world.takeStructsWithBrokenDefenses().forEach(structId => {
      this.structManager.refreshStruct(structId, mapType, false, false);
    });
  }

  menu() {
    const viewModel = new TutorialMenuViewModel();
    viewModel.render();
  }

  restartConfirm() {
    const viewModel = new TutorialConfirmViewModel(
      'Restart Tutorial?',
      'Are you sure you want to restart the tutorial? Your progress will be reset.',
      'Restart Tutorial',
      'sui-mod-primary',
      () => TutorialMode.restart(),
      () => MenuPage.router.goto('Tutorial', 'menu')
    );
    viewModel.render();
  }

  abandonConfirm() {
    const viewModel = new TutorialConfirmViewModel(
      'Abandon Tutorial?',
      'Are you sure you want to abandon the tutorial? You can revisit the tutorial later from the menu.',
      'Abandon Tutorial',
      'sui-mod-destructive',
      () => TutorialMode.exit(TutorialMode.EXIT_ABANDONED),
      () => MenuPage.router.goto('Tutorial', 'menu')
    );
    viewModel.render();
  }

  finishSimulation() {
    this.world.stopBlocks();
    MenuPage.router.goto('Tutorial', 'end');
  }

  end() {
    const hrBotTalkingTemplate = new HRBotTalkingTemplate();
    hrBotTalkingTemplate.dialogueSequence = [
      TUTORIAL_COPY.COMPLETED,
      TUTORIAL_COPY.CERTIFIED,
    ];
    hrBotTalkingTemplate.startWithScanLines = true;
    // Runs as each line is shown.
    hrBotTalkingTemplate.initPageCode = () => {
      onboardingTelemetry.reached(['tutorial.end.completed', 'tutorial.end.certified'][hrBotTalkingTemplate.dialogueIndex]);
    };
    hrBotTalkingTemplate.actionOnSequenceEnd = () => {
      MenuPage.router.goto('Tutorial', 'ftlJump');
    };
    hrBotTalkingTemplate.render();
    MenuPage.open();
  }

  ftlJump() {
    const viewModel = new TutorialStatusViewModel(
      'Status',
      TUTORIAL_COPY.FTL_JUMP,
      '/img/tutorial/new-planet-travel.gif',
      'CMD Ship jumping to a new planet',
      true
    );
    viewModel.render();

    setTimeout(() => TutorialMode.exit(TutorialMode.EXIT_COMPLETED), FTL_SCREEN_MS);
  }
}
