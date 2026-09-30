import {DTest, DTestSuite} from "../framework/DTestFramework";
import {
  fmt,
  fmtSet,
  fmtDelta,
  parse,
  fmtToken,
  fmtPercent,
  fmtDurationMs,
  fmtBlockDuration,
  fmtExact,
  toBase,
  mulRational,
  parseDecimalRational,
  baseToDisplayDecimal,
  MINUS,
} from "../util/Units";

export class UnitsTest extends DTestSuite {

  constructor() {
    super('UnitsTest');
  }

  fmtAlphaTest = new DTest('fmtAlphaTest', function(params) {
    this.assertEquals(fmt(params.v, 'ualpha'), params.expected);
  }, function() {
    return [
      {v: '0', expected: '0g'},
      {v: 0n, expected: '0g'},
      {v: '1', expected: '1μg'},
      {v: '999', expected: '1mg'},
      {v: '1000000', expected: '1g'},
      {v: '2500000', expected: '2.5g'},
      {v: '7572000000', expected: '7.57Kg'},
      {v: '59000000000', expected: '59Kg'},
      {v: '1000000000000000000', expected: '1Tg'},
      {v: '70713000000', expected: '70.71Kg'},
      {v: null, expected: '—'},
      {v: 'abc', expected: '—'},
      {v: '1.5', expected: '—'},
    ];
  });

  fmtMwTest = new DTest('fmtMwTest', function(params) {
    this.assertEquals(fmt(params.v, 'mw'), params.expected);
  }, function() {
    return [
      {v: '0', expected: '0W'},
      {v: '1', expected: '1mW'},
      {v: '99', expected: '99mW'},
      {v: '25000', expected: '25W'},
      {v: '99999', expected: '100W'},
      {v: '100000', expected: '0.1KW'},
      {v: '6877090', expected: '6.88KW'},
      {v: '15467472', expected: '15.47KW'},
      {v: '1512960000', expected: '1.51MW'},
      {v: '1000000000000000', expected: '1TW'},
      {v: '25000000000000000', expected: '25TW'},
      {v: (70713000000n * 2n).toString(), expected: '141.43MW'},
    ];
  });

  fmtOreTest = new DTest('fmtOreTest', function(params) {
    this.assertEquals(fmt(params.v, 'ore'), params.expected);
  }, function() {
    return [
      {v: '999', expected: '999g'},
      {v: '1000', expected: '1Kg'},
      {v: '0', expected: '0g'},
    ];
  });

  fmtSetTest = new DTest('fmtSetTest', function(params) {
    this.assertArrayEquals(fmtSet(params.values, params.kind), params.expected);
  }, function() {
    return [
      {
        values: ['50000', '140000', '100000000'],
        kind: 'mw',
        expected: ['0.05KW', '0.14KW', '100KW'],
      },
      {
        values: ['6490000', '6877090'],
        kind: 'mw',
        expected: ['6.49KW', '6.88KW'],
      },
      {
        values: ['0', '6877090', null],
        kind: 'mw',
        expected: ['0W', '6.88KW', '—'],
      },
      {
        values: ['0', '0'],
        kind: 'ualpha',
        expected: ['0g', '0g'],
      },
    ];
  });

  fmtDeltaTest = new DTest('fmtDeltaTest', function(params) {
    this.assertEquals(fmtDelta(params.v, params.kind), params.expected);
  }, function() {
    return [
      {v: '-120000', kind: 'mw', expected: MINUS + '0.12KW'},
      {v: '2000000', kind: 'ualpha', expected: '+2g'},
      {v: '0', kind: 'mw', expected: '+0W'},
    ];
  });

  parseTest = new DTest('parseTest', function(params) {
    const result = parse(params.text, params.kind);
    if (params.expected === null) {
      this.assertEquals(result, null);
    } else {
      this.assertEquals(result, params.expected);
    }
  }, function() {
    return [
      {text: '2.5', kind: 'ualpha', expected: 2500000n},
      {text: '1.1', kind: 'ualpha', expected: 1100000n},
      {text: '9.4Kg', kind: 'ualpha', expected: 9400000000n},
      {text: '500mg', kind: 'ualpha', expected: 500000n},
      {text: '500Mg', kind: 'ualpha', expected: null},
      {text: '0.0000001', kind: 'ualpha', expected: null},
      {text: '', kind: 'ualpha', expected: null},
      {text: 'abc', kind: 'ualpha', expected: null},
      {text: 'ug', kind: 'ualpha', expected: null},
      {text: '500ug', kind: 'ualpha', expected: 500n},
      {text: '500μg', kind: 'ualpha', expected: 500n},
    ];
  });

  fmtTokenTest = new DTest('fmtTokenTest', function(params) {
    this.assertEquals(fmtToken(params.v, params.unit), params.expected);
  }, function() {
    const unit = {
      exponent: 6,
      scale: [
        {exponent: 0, symbol: 'ack'},
        {exponent: 6, symbol: 'snack'},
      ],
    };
    return [
      {v: '98800000', unit, expected: '98.8 snack'},
      {v: '850', unit, expected: '850 ack'},
      {v: '0', unit, expected: '0 snack'},
      {v: '0', unit: {denom: 'uguild.0-9'}, expected: '0 uguild.0-9'},
    ];
  });

  fmtPercentTest = new DTest('fmtPercentTest', function(params) {
    this.assertEquals(fmtPercent(params.v), params.expected);
  }, function() {
    return [
      {v: '0.049', expected: '4.9%'},
      {v: '0.04', expected: '4.0%'},
      {v: '1', expected: '100.0%'},
      {v: null, expected: '—'},
    ];
  });

  fmtDurationTest = new DTest('fmtDurationTest', function(params) {
    this.assertEquals(fmtDurationMs(params.ms), params.expected);
  }, function() {
    return [
      {ms: 45000, expected: '45s'},
      {ms: 60000, expected: '1m'},
      {ms: 3660000, expected: '1h 1m'},
      {ms: 0, expected: '0s'},
    ];
  });

  fmtBlockDurationTest = new DTest('fmtBlockDurationTest', function() {
    this.assertEquals(fmtBlockDuration(12, 5280), '~12 blocks · ~1m');
  });

  fmtExactTest = new DTest('fmtExactTest', function() {
    this.assertEquals(fmtExact('2500000', 'ualpha'), '2,500,000 ualpha');
  });

  toBaseTest = new DTest('toBaseTest', function(params) {
    this.assertEquals(toBase(params.v), params.expected);
  }, function() {
    return [
      {v: 10n, expected: 10n},
      {v: '10', expected: 10n},
      {v: null, expected: null},
      {v: '1.5', expected: null},
      {v: '', expected: null},
    ];
  });

  rationalTest = new DTest('rationalTest', function() {
    const r = parseDecimalRational('0.96');
    this.assertEquals(mulRational(1000000n, r), 960000n);
    const commission = parseDecimalRational('0.04');
    const oneMinus = {num: commission.den - commission.num, den: commission.den};
    this.assertEquals(mulRational(1000000n, oneMinus), 960000n);
  });

  baseToDisplayDecimalTest = new DTest('baseToDisplayDecimalTest', function(params) {
    this.assertEquals(baseToDisplayDecimal(params.v), params.expected);
  }, function() {
    return [
      {v: 2500000n, expected: '2.5'},
      {v: 1000000n, expected: '1'},
      {v: 1100000n, expected: '1.1'},
      {v: 500000n, expected: '0.5'},
    ];
  });
}
