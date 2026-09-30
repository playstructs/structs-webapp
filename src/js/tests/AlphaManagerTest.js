import {DTest, DTestSuite} from "../framework/DTestFramework";
import {AlphaManager} from "../managers/AlphaManager";
import {TX_STATUS} from "../models/SigningTransaction";

/**
 * Payload-shape regression tests for AlphaManager.
 * Ensures amounts are stringified before they would hit the signing queue.
 */
export class AlphaManagerTest extends DTestSuite {

  constructor() {
    super('AlphaManagerTest');
  }

  toUAlphaStringTest = new DTest('toUAlphaStringTest', function(params) {
    const manager = new AlphaManager({}, {});
    if (params.throws) {
      let threw = false;
      try {
        manager.toUAlphaString(params.v);
      } catch (e) {
        threw = true;
      }
      this.assertEquals(threw, true);
    } else {
      this.assertEquals(manager.toUAlphaString(params.v), params.expected);
    }
  }, function() {
    return [
      {v: 2500000n, expected: '2500000'},
      {v: '1100000', expected: '1100000'},
      {v: 0n, throws: true},
      {v: '-1', throws: true},
      {v: '1.5', throws: true},
      {v: null, throws: true},
    ];
  });

  isSettledSuccessTest = new DTest('isSettledSuccessTest', function() {
    const manager = new AlphaManager({}, {});
    this.assertEquals(manager.isSettledSuccess({status: TX_STATUS.SUCCEEDED}), true);
    this.assertEquals(manager.isSettledSuccess({status: TX_STATUS.DROPPED}), false);
    this.assertEquals(manager.isSettledSuccess(null), false);
  });

  convertLegacyStillWorksTest = new DTest('convertLegacyStillWorksTest', function() {
    const manager = new AlphaManager({}, {});
    this.assertEquals(manager.convertAlphaToUAlpha(2), '2000000');
    this.assertEquals(manager.convertAlphaToUAlpha(1), '1000000');
  });
}
