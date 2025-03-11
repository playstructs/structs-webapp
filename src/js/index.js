import {MenuPage} from './MenuPage';
import {AuthController} from "./AuthController";
import {GameState} from "./GameState";

const gameState = new GameState();
global.gameState = gameState;

const authController = new AuthController(gameState);

MenuPage.router.registerController(authController);
MenuPage.initListeners();

// MenuPage.router.goto('Auth', 'index');

MenuPage.router.goto('Auth', 'signupSetUsername');
