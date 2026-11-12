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

  formatGroupedTest = new DTest('formatGroupedTest', function(params) {
    const numberFormatter = new NumberFormatter();
    this.assertEquals(numberFormatter.formatGrouped(params.number), params.expected);
  }, function() {
    return [
      {number: 0, expected: '0'},
      {number: 73, expected: '73'},
      {number: 1075, expected: '1,075'},
      {number: 1148, expected: '1,148'},
      {number: 1234567, expected: '1,234,567'},
      {number: 1075.9, expected: '1,075'},
      {number: null, expected: '0'},
    ];
  });
}
