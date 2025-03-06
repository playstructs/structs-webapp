import {MenuPage} from './MenuPage';
import {AuthController} from "./AuthController";

const authController = new AuthController();

MenuPage.router.registerController(authController);

MenuPage.router.goto('Auth', 'index');
// MenuPage.router.goto('Auth', 'signupIncomingCall');
