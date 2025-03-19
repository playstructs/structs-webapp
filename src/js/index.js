import {MenuPage} from './framework/MenuPage';
import {AuthController} from "./controllers/AuthController";
import {GameState} from "./models/GameState";

const gameState = new GameState();
global.gameState = gameState;

const authController = new AuthController(gameState);

MenuPage.router.registerController(authController);
MenuPage.initListeners();

MenuPage.router.goto('Auth', 'index');

// MenuPage.router.goto('Auth', 'signupRecoveryKeyCreation');
