import {DTest, DTestSuite} from "../framework/DTestFramework";
import {parseWithBigInt, stringifyWithBigInt} from "../util/BigIntJson";

export class BigIntJsonTest extends DTestSuite {

  constructor() {
    super('BigIntJsonTest');
  }

  roundTripTest = new DTest('roundTripTest', function() {
    const infusion = {fuel_p: 12345678901234567890n, ratio_p: 0n, commission: '0.05', nested: [{v: -5n}], none: null};
    const restored = parseWithBigInt(stringifyWithBigInt(infusion));

    this.assertEquals(restored.fuel_p, 12345678901234567890n);
    this.assertEquals(restored.ratio_p, 0n);
    this.assertEquals(restored.commission, '0.05');
    this.assertEquals(restored.nested[0].v, -5n);
    this.assertEquals(restored.none, null);
  });

  plainObjectsUntouchedTest = new DTest('plainObjectsUntouchedTest', function() {
    const restored = parseWithBigInt(stringifyWithBigInt({__bigint: 1, other: 2}));
    this.assertEquals(restored.__bigint, 1);
    this.assertEquals(parseWithBigInt(null), null);
  });

  equalOptionsSerializeEquallyTest = new DTest('equalOptionsSerializeEquallyTest', function() {
    this.assertEquals(stringifyWithBigInt({a: 1n}) === stringifyWithBigInt({a: 1n}), true);
    this.assertEquals(stringifyWithBigInt({a: 1n}) === stringifyWithBigInt({a: 2n}), false);
  });
}
