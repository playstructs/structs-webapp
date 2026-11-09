import {DTest, DTestSuite} from "../framework/DTestFramework";
import {AlphaManager} from "../managers/AlphaManager";

/**
 * Payload-shape regression tests for AlphaManager.
 * Ensures amounts are exact ualpha strings before they reach an intent.
 */
export class AlphaManagerTest extends DTestSuite {

  constructor() {
    super('AlphaManagerTest');
  }

  convertAlphaToUAlphaTest = new DTest('convertAlphaToUAlphaTest', function() {
    const manager = new AlphaManager({}, {});
    this.assertEquals(manager.convertAlphaToUAlpha(2), '2000000');
    this.assertEquals(manager.convertAlphaToUAlpha(1), '1000000');
    this.assertEquals(manager.convertAlphaToUAlpha('9007199254740993'), '9007199254740993000000');
    let threw = false;
    try {
      manager.convertAlphaToUAlpha(2 ** 53 + 2);
    } catch (e) {
      threw = true;
    }
    this.assertEquals(threw, true);
  });
}
