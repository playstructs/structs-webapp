import {MenuPage} from './framework/MenuPage';
import {AuthController} from "./controllers/AuthController";
import {GameState} from "./models/GameState";
import {GuildAPI} from "./api/GuildAPI";
import {WalletManager} from "./managers/WalletManager";
import {AuthManager} from "./managers/AuthManager";
import {GrassManager} from "./framework/GrassManager";
import {BlockListener} from "./grass_listeners/BlockListener";
import {HUDViewModel} from "./view_models/HUDViewModel";
import {AccountController} from "./controllers/AccountController";
import {SigningClientManager} from "./managers/SigningClientManager";
import {PlanetManager} from "./managers/PlanetManager";
import {PlayerAddressManager} from "./managers/PlayerAddressManager";
import {PermissionManager} from "./managers/PermissionManager";
import {PlayerAddressPendingFactory} from "./factories/PlayerAddressPendingFactory";
import {GenericController} from "./controllers/GenericController";
import {AlphaManager} from "./managers/AlphaManager";
import {GuildController} from "./controllers/GuildController";
import {FleetController} from "./controllers/FleetController";
import {FleetManager} from "./managers/FleetManager";
import {RaidManager} from "./managers/RaidManager";
import {MapComponent} from "./view_models/components/map/MapComponent";
import {MapManager} from "./managers/MapMananger";
import {MAP_CONTAINER_IDS} from "./constants/MapConstants";
import {CheatsheetContentBuilder} from "./builders/CheatsheetContentBuilder";
import {StructManager} from "./managers/StructManager";
import {TaskManager} from "./managers/TaskManager";
import {TaskStateFactory} from "./factories/TaskStateFactory";
import {EVENTS} from "./constants/Events";
import {TASK} from "./constants/TaskConstants";
import {PLAYER_TYPES} from "./constants/PlayerTypes";
import {DestroyedStructManager} from "./managers/DestroyedStructManager";
import {NotificationDialogue} from "./framework/NotificationDialogue";
import {DialogueKeyboardControls} from "./framework/DialogueKeyboardControls";
import {MapPanController} from "./framework/MapPanController";
import {AnimationEventQueue} from "./data_structures/AnimationEventQueue";
import {LOG_LEVEL, RESUME_CHECK_INTERVAL_MS} from "./constants/GrassConstants";
import {TutorialMode} from "./tutorial/TutorialMode";
import {TutorialWorld} from "./tutorial/TutorialWorld";
import {SimulatedGuildAPI} from "./tutorial/SimulatedGuildAPI";
import {SimulatedSigningClientManager} from "./tutorial/SimulatedSigningClientManager";
import {SimulatedTaskManager} from "./tutorial/SimulatedTaskManager";
import {TutorialController} from "./controllers/TutorialController";
import {onboardingTelemetry} from "./telemetry/OnboardingTelemetry";
import {StartupRecovery, startupReads} from "./managers/StartupRecovery";
import {AuthenticationError} from "./errors/AuthenticationError";
import {DeviceRegistrationStore} from "./managers/DeviceRegistrationStore";

// TODO Remove eventually...
// Or formalize a migration system (MigrationManager?)
const actionBarMigrate = localStorage.getItem("actionBarMigrate-20260107");
if (!actionBarMigrate) {
  console.log('Migrating to new Struct Type System');
  localStorage.setItem("actionBarMigrate-20260107", "true");
  localStorage.removeItem('getStructTypes');
}

// The tutorial boots the same app against an in-memory simulation instead of
// the player's account: no network, no transactions, no saved state.
const tutorialMode = TutorialMode.isActive();
const tutorialWorld = tutorialMode ? new TutorialWorld() : null;

const gameState = new GameState();
gameState.persistenceEnabled = !tutorialMode;
global.gameState = gameState;

const guildAPI = tutorialMode ? new SimulatedGuildAPI(tutorialWorld) : new GuildAPI();
global.guildAPI = guildAPI;
gameState.guildAPI = guildAPI;

const walletManager = new WalletManager();
global.walletManager = walletManager;

const grassManager = new GrassManager(
  `ws://${window.location.hostname}:1443`,
  "structs.>",
  gameState,
  LOG_LEVEL.KEY_PLAYER
);

const blockGrassManager = new GrassManager(
  `ws://${window.location.hostname}:1443`,
  "consensus",
  gameState
);

const signingClientManager = tutorialMode
  ? new SimulatedSigningClientManager(gameState, tutorialWorld)
  : new SigningClientManager(gameState);
global.signingClientManager = signingClientManager;

const structManager = new StructManager(gameState, guildAPI, signingClientManager);

const planetManager = new PlanetManager(gameState, signingClientManager, guildAPI);

const playerAddressManager = new PlayerAddressManager(gameState, guildAPI);

const permissionManager = new PermissionManager();

const playerAddressPendingFactory = new PlayerAddressPendingFactory();

const mapManager = new MapManager(gameState);

const raidManager = new RaidManager(gameState, guildAPI, grassManager, mapManager, structManager);

const taskStateFactory = new TaskStateFactory();

const taskManager = tutorialMode
  ? new SimulatedTaskManager(gameState, guildAPI, signingClientManager, taskStateFactory)
  : new TaskManager(gameState, guildAPI, signingClientManager, taskStateFactory);
global.taskManager = taskManager;

const destroyedStructManager = new DestroyedStructManager(gameState, structManager);
global.destroyedStructManager = destroyedStructManager;

const animationEventQueue = new AnimationEventQueue();
animationEventQueue.initListeners();
gameState.animationEventQueue = animationEventQueue;

const authManager = new AuthManager(
  gameState,
  guildAPI,
  walletManager,
  grassManager,
  signingClientManager,
  planetManager,
  playerAddressManager,
  playerAddressPendingFactory,
  raidManager,
  mapManager,
  taskManager,
  structManager,
  destroyedStructManager,
  permissionManager
);

guildAPI.setReauthenticator(() => authManager.reauthenticate());

const alphaManager = new AlphaManager(gameState, signingClientManager);

const fleetManager = new FleetManager(gameState, signingClientManager);

const blockListener = new BlockListener(gameState);

const authController = new AuthController(
  gameState,
  guildAPI,
  walletManager,
  authManager
);
const accountController = new AccountController(
  gameState,
  guildAPI,
  authManager,
  permissionManager,
  alphaManager,
  grassManager,
  signingClientManager
);
const genericController = new GenericController(
  gameState
);
const guildController = new GuildController(
  gameState,
  guildAPI,
  grassManager,
  alphaManager
);
const fleetController = new FleetController(
  gameState,
  guildAPI,
  grassManager,
  fleetManager,
  raidManager,
  planetManager,
  mapManager,
  structManager
);

gameState.alphaBaseMap = new MapComponent(
  gameState,
  signingClientManager,
  structManager,
  taskManager,
  MAP_CONTAINER_IDS.ALPHA_BASE,
  'alpha-base'
);

gameState.raidMap = new MapComponent(
  gameState,
  signingClientManager,
  structManager,
  taskManager,
  MAP_CONTAINER_IDS.RAID,
  'raid'
);

gameState.previewMap = new MapComponent(
  gameState,
  signingClientManager,
  structManager,
  taskManager,
  MAP_CONTAINER_IDS.PREVIEW,
  'preview',
  false
);

MenuPage.gameState = gameState;
MenuPage.mapManager = mapManager;
MenuPage.router.onNavigate = (controllerName, pageName) => onboardingTelemetry.recordNavigation(controllerName, pageName);

MenuPage.router.registerController(authController);
MenuPage.router.registerController(accountController);
MenuPage.router.registerController(genericController);
MenuPage.router.registerController(guildController);
MenuPage.router.registerController(fleetController);
MenuPage.initListeners();
MenuPage.sui.cheatsheet.setContentBuilder(new CheatsheetContentBuilder(gameState));
global.menuPage = MenuPage;

NotificationDialogue.initListeners();

DialogueKeyboardControls.initListeners();

new MapPanController().init();

if (!tutorialMode) {
  grassManager.init();
  blockGrassManager.registerListener(blockListener);
  blockGrassManager.init();
}

// A backgrounded or slept page can come back with WebSockets that report a
// healthy readyState but carry no traffic, which no close event announces.
// These are the moments where that becomes observable.
// The signing transport dies from the same page suspension, but unlike grass it
// harms nothing until the player acts, so its probe is forced only here and left
// throttled on the timer below.
const onResume = (forceResumeCheck = true) => {
  grassManager.resumeCheck();
  blockGrassManager.resumeCheck();
  signingClientManager.resumeCheck(forceResumeCheck).then();
};

if (!tutorialMode) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      onResume();
    }
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      onResume();
    }
  });

  // Wrapped so the event object cannot land in the force parameter.
  window.addEventListener('online', () => onResume());
  window.addEventListener('focus', () => onResume());

  // The events above only fire when the user comes back, but a socket can go
  // quiet while the tab is right in front of them, and no event announces that.
  // The signing probe rides along throttled, which also covers the case where
  // grass was stale at resume and its own check had to be deferred.
  setInterval(() => {
    onResume(false);
  }, RESUME_CHECK_INTERVAL_MS);
}

const hudContainer = document.getElementById(HUDViewModel.containerId);
const startupRecovery = tutorialMode ? null : new StartupRecovery(
  () => gameState.persistenceEnabled && gameState.isSessionCurrent()
);

/**
 * Load the saved session and guild configuration, then open the first page.
 */
async function startApplication() {
  if (!tutorialMode) {
    await gameState.load();
    DeviceRegistrationStore.expireRecovery()
      .catch(error => console.debug('[DeviceRecovery] expired keys could not be removed:', error));
  }
  const loadConfiguration = () => startupReads([() => guildAPI.getSettings(), () => guildAPI.getThisGuild()]);
  [gameState.settings, gameState.thisGuild] = startupRecovery
    ? await startupRecovery.run(loadConfiguration, {retryAuthentication: true})
    : await loadConfiguration();

  HUDViewModel.init(gameState, signingClientManager, structManager, taskManager, alphaManager, grassManager);
  if (tutorialMode) {
    // In the simulation the portrait opens Combat Training's own menu.
    HUDViewModel.bottomLeftActionBar.profileClickHandler = () => TutorialMode.openMenu();
  }
  hudContainer.innerHTML = HUDViewModel.render();
  HUDViewModel.initPageCode();

  MenuPage.sui.autoInitAll();

  if (tutorialMode) {
    const tutorialController = new TutorialController(
      gameState,
      tutorialWorld,
      signingClientManager,
      guildAPI,
      structManager,
      mapManager,
      destroyedStructManager
    );
    MenuPage.router.registerController(tutorialController);

    // Tutorial pages are never restored after a reload.
    MenuPage.router.enablePreviewMode();
    MenuPage.router.goto('Tutorial', 'loading');

    MenuPage.hideLoadingScreen();
  } else if (!gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) {
    TutorialMode.consumeExited();
    // The opening crawl (Auth/introduction) is shelved for now.
    try {
      if (!await authManager.restoreDeviceActivation()) MenuPage.router.goto('Auth', 'index');
    } catch (error) {
      console.debug('[DeviceActivation] saved activation unavailable:', error);
      MenuPage.router.goto('Auth', 'index');
    }

    MenuPage.hideLoadingScreen();
  } else {
    const tutorialExit = TutorialMode.consumeExited();
    const returningFromTutorial = tutorialExit !== null;
    const savedAddress = gameState.signingAccount?.address;
    const savedPlayerId = gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    const current = startupRecovery.current;
    startupRecovery.current = () => current()
      && gameState.signingAccount?.address === savedAddress
      && gameState.keyPlayers[PLAYER_TYPES.PLAYER].id === savedPlayerId;

    const loggedIn = await authManager.login(
      savedPlayerId,
      startupRecovery.signal,
      operation => startupRecovery.run(operation)
    );
    if (!loggedIn) throw new AuthenticationError('Saved session was rejected',401);
    startupRecovery.assertCurrent();
    MenuPage.close();
    if (!returningFromTutorial) {
      MenuPage.router.restore('Fleet', 'index');
    }
    MenuPage.hideLoadingScreen();
    if (returningFromTutorial) {
      TutorialMode.frameHomeAfterReturn(gameState.keyPlayers[PLAYER_TYPES.PLAYER].id);
      // The FTL jump counts as finished once the player is in the real game.
      if (tutorialExit === TutorialMode.EXIT_COMPLETED) {
        onboardingTelemetry.reached('tutorial.end.ftl_jump');
      }
    }
  }

  if (!tutorialMode) {
    // Start the hashing engine after a delay
    new Promise(resolve => setTimeout(resolve, TASK.START_DELAY)).then(() => window.dispatchEvent(new CustomEvent(EVENTS.TASK_CMD_MANAGER_RESUME)));
  }
}

startApplication().catch(error => {
  if (startupRecovery?.signal.aborted || (!tutorialMode && !gameState.isSessionCurrent())) return;
  console.warn('[Startup] session could not be restored:', error);
  // Stop partial runtime work, retaining the saved key and signed journal. A
  // rejected API login is not authoritative evidence of native revocation.
  signingClientManager.stopForLogout?.();
  authManager.sessionAuthority?.stop();
  authManager.workRefresh?.stop();
  gameState.alphaRefresh?.stop();
  taskManager.closeSession?.();
  MenuPage.router.goto('Auth', 'index');
  MenuPage.open();
  MenuPage.hideLoadingScreen();
}).finally(() => startupRecovery?.finish());
