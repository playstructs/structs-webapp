import {MenuPageLayout} from './MenuPageLayout';

global.webpackSetupTest = 'It works';

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
MenuPageLayout.setDialogueScreenThemeToNeutral();

MenuPageLayout.setDialogueScreenContent(`
<strong>Struct Commandz:</strong>
Please stop doing stuff wrong. Do it right instead.
`);

MenuPageLayout.initCloseBtnListener();
