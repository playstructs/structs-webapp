import {MenuPage} from './framework/MenuPage';
import {AuthController} from "./controllers/AuthController";
import {GameState} from "./models/GameState";
import {GuildAPI} from "./api/GuildAPI";
import {WalletManager} from "./managers/WalletManager";
import {AuthManager} from "./managers/AuthManager";
import {GrassManager} from "./framework/GrassManager";
import {BlockListener} from "./grass_listeners/BlockListener";
import {HUDViewModel} from "./view_models/HUDViewModel";

// localStorage.clear();

const gameState = new GameState();
global.gameState = gameState;

const guildAPI = new GuildAPI();

const walletManager = new WalletManager();
const grassManager = new GrassManager(
  "ws://localhost:1443",
  "structs.>"
);
const authManager = new AuthManager(
  gameState,
  guildAPI,
  walletManager,
  grassManager
);

const blockListener = new BlockListener(gameState);

const authController = new AuthController(
  gameState,
  guildAPI,
  walletManager,
  authManager
);

MenuPage.router.registerController(authController);
MenuPage.initListeners();

grassManager.registerListener(blockListener);
grassManager.init();

const hudContainer = document.getElementById('hud-container');

const hud = new HUDViewModel(gameState);
hudContainer.innerHTML = hud.render();
hud.initPageCode();

await gameState.load();
gameState.thisGuild = await guildAPI.getThisGuild();

if (gameState.lastSaveBlockHeight === 0) {
  MenuPage.router.goto('Auth', 'index');
} else {
  MenuPage.close();
}
