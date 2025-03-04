import {MenuPageLayout} from './MenuPageLayout';
import {MenuPageRouter} from "./MenuPageRouter";
import {AuthController} from "./AuthController";

MenuPageLayout.disableCloseBtn();
MenuPageLayout.enableCloseBtn();

MenuPageLayout.setBodyContent(`
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

MenuPageLayout.setDialogueScreenThemeToEnemy();

MenuPageLayout.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);

MenuPageLayout.initListeners();

MenuPageLayout.dialogueBtnAHandler = () => { console.log('A Pressed'); };
MenuPageLayout.dialogueBtnBHandler = () => { console.log('B Pressed'); };

MenuPageLayout.hideAndClearDialoguePanel();
MenuPageLayout.showDialoguePanel();

MenuPageLayout.setDialogueScreenContent(`
<strong>Struct Command:</strong>
Please stop doing stuff wrong. Do it right instead.
`);
MenuPageLayout.dialogueBtnAHandler = () => { console.log('A'); };
MenuPageLayout.dialogueBtnBHandler = () => { console.log('B'); };

MenuPageLayout.disableDialogueBtnB();
MenuPageLayout.enableDialogueBtnB();
MenuPageLayout.disableDialogueBtnA();
MenuPageLayout.enableDialogueBtnA();

const menuPageRouter = new MenuPageRouter();
const authController = new AuthController();
menuPageRouter.registerController(authController);
menuPageRouter.goto('Auth', 'index');