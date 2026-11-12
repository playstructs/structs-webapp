import {DTest, DTestSuite} from "../framework/DTestFramework";
import {normalizeRecoveryKey} from "../util/RecoveryKey";

export class RecoveryKeyTest extends DTestSuite {

  constructor() {
    super('RecoveryKeyTest');
  }

  normalizeRecoveryKeyTest = new DTest('normalizeRecoveryKeyTest', function(params) {
    this.assertEquals(normalizeRecoveryKey(params.input), params.expected);
  }, function() {
    const key = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
    return [
      {input: key, expected: key},
      {input: `${key} `, expected: key},
      {input: `  ${key}\n`, expected: key},
      {input: key.replace('abandon', 'Abandon'), expected: key},
      {input: key.toUpperCase(), expected: key},
      {input: key.replace(/ /g, '  ').replace('able', 'able\t'), expected: key},
      {input: key.replace('about', '\nabout'), expected: key},
      {input: '', expected: ''},
      {input: '   ', expected: ''},
    ];
  });
}
