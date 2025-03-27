import {DTest, DTestSuite} from "../framework/DTestFramework";
import {NumberFormatter} from "../util/NumberFormatter";

export class NumberFormatterTest extends DTestSuite {

  constructor() {
    super('NumberFormatterTest');
  }

  formatTest = new DTest('formatTest', function(params) {
    const numberFormatter = new NumberFormatter();
    this.assertEquals(numberFormatter.format(params.number), params.expected);
  }, function() {
    return [
      {
        number: '100',
        expected: '100'
      },
      {
        number: '100.10',
        expected: '100'
      },
      {
        number: '123456',
        expected: '123k'
      },
      {
        number: `12345678`,
        expected: `12M`
      },
      {
        number: `1234567801`,
        expected: `1G`
      },
    ];
  });
}
