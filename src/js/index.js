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

const gameState = new GameState();
global.gameState = gameState;

const guildAPI = new GuildAPI();
global.guildAPI = guildAPI;

const walletManager = new WalletManager();
global.walletManager = walletManager;

const grassManager = new GrassManager(
  "ws://localhost:1443",
  "structs.>"
);

const blockGrassManager = new GrassManager(
  "ws://localhost:1443",
  "consensus"
);

const signingClientManager = new SigningClientManager(gameState);

const planetManager = new PlanetManager(gameState, signingClientManager);

const playerAddressManager = new PlayerAddressManager(gameState, guildAPI);

const permissionManager = new PermissionManager();

const playerAddressPendingFactory = new PlayerAddressPendingFactory();

const authManager = new AuthManager(
  gameState,
  guildAPI,
  walletManager,
  grassManager,
  signingClientManager,
  planetManager,
  playerAddressManager,
  playerAddressPendingFactory
);

const alphaManager = new AlphaManager(gameState);

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
  grassManager
);
const genericController = new GenericController(
  gameState
);
const guildController = new GuildController(
  gameState,
  guildAPI
);

MenuPage.gameState = gameState;
MenuPage.router.registerController(authController);
MenuPage.router.registerController(accountController);
MenuPage.router.registerController(genericController);
MenuPage.router.registerController(guildController);
MenuPage.initListeners();

grassManager.init();
blockGrassManager.registerListener(blockListener);
blockGrassManager.init();

const hudContainer = document.getElementById('hud-container');

const hud = new HUDViewModel(gameState);
hudContainer.innerHTML = hud.render();
hud.initPageCode();

await gameState.load();
gameState.thisGuild = await guildAPI.getThisGuild();

if (!gameState.thisPlayerId) {
  MenuPage.router.goto('Auth', 'index');
} else {
  authManager.login(gameState.thisPlayerId).then(() => {

    playerAddressManager.addPlayerAddressMeta();

    MenuPage.close();
    // MenuPage.router.goto('Account', 'index');
    MenuPage.router.restore('Account', 'index');

  });
}
