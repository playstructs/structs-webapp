import {MenuPage} from './framework/MenuPage';
import {AuthController} from "./controllers/AuthController";
import {GameState} from "./models/GameState";
import {GuildAPI} from "./api/GuildAPI";
import {WalletManager} from "./managers/WalletManager";
import {AuthManager} from "./managers/AuthManager";
import {GuildManager} from "./managers/GuildManager";
import {GrassManager} from "./managers/GrassManager";

const gameState = new GameState();
global.gameState = gameState;

const guildAPI = new GuildAPI();

const guildManager = new GuildManager(gameState, guildAPI);
const walletManager = new WalletManager();
const grassManager = new GrassManager(gameState);
const authManager = new AuthManager(
  gameState,
  guildAPI,
  walletManager,
  grassManager
);

const authController = new AuthController(
  gameState,
  guildAPI,
  walletManager,
  authManager
);

MenuPage.router.registerController(authController);
MenuPage.initListeners();

await guildManager.getThisGuild();

grassManager.init();

MenuPage.router.goto('Auth', 'index');

// MenuPage.router.goto('Auth', 'signupRecoveryKeyCreation');
