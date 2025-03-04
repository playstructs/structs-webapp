import {MenuPage} from './MenuPage';
import {MenuPageRouter} from "./MenuPageRouter";
import {AuthController} from "./AuthController";

MenuPage.disableCloseBtn();
MenuPage.enableCloseBtn();

MenuPage.setBodyContent(`
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
<div>Hello World</div>
<br>
`);

MenuPage.setDialogueScreenThemeToEnemy();

MenuPage.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);

MenuPage.initListeners();

MenuPage.dialogueBtnAHandler = () => { console.log('A Pressed'); };
MenuPage.dialogueBtnBHandler = () => { console.log('B Pressed'); };

MenuPage.hideAndClearDialoguePanel();
MenuPage.showDialoguePanel();

MenuPage.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);
MenuPage.dialogueBtnAHandler = () => { console.log('A'); };
MenuPage.dialogueBtnBHandler = () => { console.log('B'); };

MenuPage.disableDialogueBtnB();
MenuPage.enableDialogueBtnB();
MenuPage.disableDialogueBtnA();
MenuPage.enableDialogueBtnA();

const authController = new AuthController();
MenuPage.router.registerController(authController);
MenuPage.router.goto('Auth', 'index');