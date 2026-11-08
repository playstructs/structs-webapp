import {DTest, DTestSuite} from "../framework/DTestFramework";
import {CheatsheetContentBuilder} from "../builders/CheatsheetContentBuilder";

/**
 * Covers the cheatsheet shown when the Deploy button on an empty tile's action
 * bar is pressed and held. The button had no cheatsheet at all.
 */
export class DeployCheatsheetTest extends DTestSuite {

  constructor() {
    super('DeployCheatsheetTest');
  }

  deployCheatsheetNamesTheActionTest = new DTest('deployCheatsheetNamesTheActionTest', function() {
    const html = (new CheatsheetContentBuilder({})).build({suiCheatsheet: 'deploy'});

    this.assertEquals(html.includes('DEPLOY'), true);
    this.assertEquals(html.includes('Choose a Struct to deploy.'), true);
  });

  // Opening the deploy menu is free, so there is no battery cost to show.
  deployCheatsheetShowsNoBatteryCostTest = new DTest('deployCheatsheetShowsNoBatteryCostTest', function() {
    const html = (new CheatsheetContentBuilder({})).build({suiCheatsheet: 'deploy'});

    this.assertEquals(html.includes('sui-battery-chunk'), false);
  });
}
