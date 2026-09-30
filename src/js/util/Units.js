/**
 * Base-unit quantity formatting and parsing.
 *
 * Models store exact integer base units (ualpha, milliwatts, grams ore) as
 * BigInt. Convert to a display string only at render time.
 *
 * @see GET /api/denom for the machine-readable scale tables.
 */

/** @type {Object.<string, Array<[number, bigint, string]>>} [minDigits, exponent, unit] */
export const LADDERS = {
  ualpha: [
    [16, 18n, 'Tg'],
    [10, 9n, 'Kg'],
    [6, 6n, 'g'],
    [3, 3n, 'mg'],
    [0, 0n, 'μg'],
  ],
  mw: [
    [16, 15n, 'TW'],
    [10, 9n, 'MW'],
    [6, 6n, 'KW'],
    [3, 3n, 'W'],
    [0, 0n, 'mW'],
  ],
  ore: [
    [12, 12n, 'Tg'],
    [4, 3n, 'Kg'],
    [0, 0n, 'g'],
  ],
};

/**
 * Exactly zero reads in the display unit (0g, 0W) rather than the base rung
 * (0μg, 0mW), matching UNIT_DISPLAY_FORMAT.
 *
 * @type {Object.<string, string>}
 */
export const ZERO_UNITS = {
  ualpha: 'g',
  mw: 'W',
  ore: 'g',
};

export const MINUS = '−';
export const APPROX_TOOLTIP = 'rounded — exact amount unavailable';

/**
 * Exact integer base units, or null. Rejects fractions, NaN, '', null —
 * never returns 0n for junk.
 *
 * @param {bigint|string|number|null|undefined} v
 * @return {bigint|null}
 */
export function toBase(v) {
  if (typeof v === 'bigint') {
    return v;
  }
  if (v === null || v === undefined) {
    return null;
  }
  const s = String(v).trim();
  return /^-?\d+$/.test(s) ? BigInt(s) : null;
}

/**
 * @param {bigint} abs
 * @param {Array<[number, bigint, string]>} ladder
 * @return {[number, bigint, string]}
 */
function stepFor(abs, ladder) {
  const digits = abs.toString().length;
  return ladder.find(([min]) => digits >= min) ?? ladder[ladder.length - 1];
}

/**
 * Round half-up to 2 decimals and trim trailing zeros: exact, no floats.
 *
 * @param {bigint} abs
 * @param {bigint} exp
 * @return {string}
 */
function scaled(abs, exp) {
  const div = 10n ** exp;
  const h = (abs * 100n + div / 2n) / div;
  const int = h / 100n;
  const frac = h % 100n;
  if (frac === 0n) {
    return int.toString();
  }
  if (frac % 10n === 0n) {
    return `${int}.${frac / 10n}`;
  }
  return `${int}.${frac.toString().padStart(2, '0')}`;
}

/**
 * Format one base-unit value with its ladder.
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {'ualpha'|'mw'|'ore'} kind
 * @return {string}
 */
export function fmt(v, kind) {
  const n = toBase(v);
  if (n === null) {
    return '—';
  }
  if (n === 0n) {
    return '0' + ZERO_UNITS[kind];
  }
  const abs = n < 0n ? -n : n;
  const [, exp, unit] = stepFor(abs, LADDERS[kind]);
  return (n < 0n ? MINUS : '') + scaled(abs, exp) + unit;
}

/**
 * Format a set of values on the unit the largest absolute would pick.
 *
 * @param {Array<bigint|string|number|null|undefined>} values
 * @param {'ualpha'|'mw'|'ore'} kind
 * @return {string[]}
 */
export function fmtSet(values, kind) {
  const nums = values.map(toBase);
  const max = nums.reduce((m, n) => {
    if (n === null) {
      return m;
    }
    const abs = n < 0n ? -n : n;
    return abs > m ? abs : m;
  }, 0n);
  const [, exp, unit] = stepFor(max, LADDERS[kind]);
  return nums.map((n) => {
    if (n === null) {
      return '—';
    }
    if (n === 0n) {
      return '0' + ZERO_UNITS[kind];
    }
    const abs = n < 0n ? -n : n;
    return (n < 0n ? MINUS : '') + scaled(abs, exp) + unit;
  });
}

/**
 * Signed delta: leading + or − before the absolute formatted value.
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {'ualpha'|'mw'|'ore'} kind
 * @return {string}
 */
export function fmtDelta(v, kind) {
  const n = toBase(v);
  if (n === null) {
    return '—';
  }
  return (n < 0n ? MINUS : '+') + fmt(n < 0n ? -n : n, kind);
}

/**
 * Exact base amount for money-moving screens, e.g. "2,500,000 ualpha".
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {string} denom
 * @return {string}
 */
export function fmtExact(v, denom) {
  const n = toBase(v);
  if (n === null) {
    return '—';
  }
  const abs = n < 0n ? -n : n;
  const digits = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0n ? MINUS : '') + digits + ' ' + denom;
}

/**
 * Ladder figure plus exact base amount for confirm dialogs.
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {'ualpha'|'mw'|'ore'} kind
 * @param {string} [denom]
 * @return {string}
 */
export function fmtWithExact(v, kind, denom) {
  const baseDenom = denom ?? (kind === 'mw' ? 'mW' : kind === 'ore' ? 'g' : 'ualpha');
  const ladder = fmt(v, kind);
  if (ladder === '—') {
    return '—';
  }
  return `${ladder} · ${fmtExact(v, baseDenom)}`;
}

/**
 * Player input → exact base units, or null. Bare numbers use the display unit
 * (g for Alpha/ore, W for energy). Accepts `ug` as an alias for `μg`.
 *
 * @param {string|null|undefined} text
 * @param {'ualpha'|'mw'|'ore'} kind
 * @param {string} [defaultUnit]
 * @return {bigint|null}
 */
export function parse(text, kind, defaultUnit) {
  const fallback = defaultUnit ?? (kind === 'mw' ? 'W' : 'g');
  const m = String(text ?? '').trim().replace(/,/g, '')
    .match(/^(-?)(\d+)(?:\.(\d+))?\s*([A-Za-zμ]*)$/);
  if (!m) {
    return null;
  }
  let unit = (m[4] || fallback).replace(/^ug$/, 'μg');
  const step = LADDERS[kind].find((s) => s[2] === unit);
  if (!step) {
    return null;
  }
  const exp = Number(step[1]);
  const frac = m[3] ?? '';
  if (frac.length > exp) {
    return null;
  }
  const value = BigInt(m[2]) * (10n ** step[1])
    + BigInt((frac + '0'.repeat(exp)).slice(0, exp) || '0');
  return m[1] === '-' ? -value : value;
}

/**
 * Guild tokens from an /api/denom unit entry.
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {{scale?: Array<{exponent: number, symbol: string}>, denom?: string, exponent?: number}|null|undefined} unitEntry
 * @return {string}
 */
export function fmtToken(v, unitEntry) {
  const n = toBase(v);
  if (n === null) {
    return '—';
  }
  if (!unitEntry?.scale?.length) {
    return `${n} ${unitEntry?.denom ?? 'raw'}`;
  }
  const top = unitEntry.scale[unitEntry.scale.length - 1];
  const base = unitEntry.scale[0];
  if (n === 0n) {
    const display = unitEntry.scale.find((s) => s.exponent === unitEntry.exponent) ?? top;
    return `0 ${display.symbol}`;
  }
  const div = 10n ** BigInt(top.exponent);
  const abs = n < 0n ? -n : n;
  const sign = n < 0n ? MINUS : '';
  if (abs >= div) {
    return `${sign}${scaled(abs, BigInt(top.exponent))} ${top.symbol}`;
  }
  return `${sign}${abs} ${base.symbol}`;
}

/**
 * One-decimal percentage from a 0–1 decimal string (or number).
 * Uses string arithmetic; never JS float multiply by 100.
 *
 * @param {string|number|null|undefined} ratio
 * @return {string}
 */
export function fmtPercent(ratio) {
  if (ratio === null || ratio === undefined || ratio === '') {
    return '—';
  }
  const s = String(ratio).trim();
  const m = s.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!m) {
    return '—';
  }
  const sign = m[1];
  const frac = m[3] ?? '';
  const den = 10n ** BigInt(frac.length || 0);
  const num = BigInt(m[2] + frac);
  // tenths of a percent = round(value * 1000)
  const tenths = den === 0n ? 0n : (num * 1000n + den / 2n) / den;
  const whole = tenths / 10n;
  const dec = tenths % 10n;
  return `${sign}${whole}.${dec}%`;
}

/**
 * Duration from milliseconds: `45s`, `1m`, `1h 2m`.
 *
 * @param {number|null|undefined} ms
 * @return {string}
 */
export function fmtDurationMs(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0) {
    return '—';
  }
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours === 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(' ');
}

/**
 * Block-based duration using measured ms/block: `~12 blocks · ~1m`.
 *
 * @param {number|bigint|null|undefined} blocks
 * @param {number} msPerBlock
 * @return {string}
 */
export function fmtBlockDuration(blocks, msPerBlock) {
  const n = typeof blocks === 'bigint' ? Number(blocks) : Number(blocks);
  if (!Number.isFinite(n) || n < 0 || !Number.isFinite(msPerBlock) || msPerBlock <= 0) {
    return '—';
  }
  const blockLabel = `~${Math.round(n)} blocks`;
  const timeLabel = fmtDurationMs(n * msPerBlock);
  if (timeLabel === '—') {
    return blockLabel;
  }
  return `${blockLabel} · ~${timeLabel}`;
}

/**
 * Full integer with optional thousands separators. Never abbreviates.
 *
 * @param {bigint|string|number|null|undefined} v
 * @param {boolean} [withSeparators=false]
 * @return {string}
 */
export function fmtCount(v, withSeparators = false) {
  const n = toBase(v);
  if (n === null) {
    return '—';
  }
  const abs = n < 0n ? -n : n;
  let digits = abs.toString();
  if (withSeparators) {
    digits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return (n < 0n ? MINUS : '') + digits;
}

/**
 * Parse a decimal string (e.g. commission "0.049") into a rational {num, den}
 * suitable for exact BigInt arithmetic. Returns null for junk.
 *
 * @param {string|number|null|undefined} decimal
 * @return {{num: bigint, den: bigint}|null}
 */
export function parseDecimalRational(decimal) {
  if (decimal === null || decimal === undefined || decimal === '') {
    return null;
  }
  const s = String(decimal).trim();
  const m = s.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!m) {
    return null;
  }
  const frac = m[3] ?? '';
  const den = 10n ** BigInt(frac.length);
  const num = BigInt(m[2] + frac);
  return {num: m[1] === '-' ? -num : num, den: den === 0n ? 1n : den};
}

/**
 * Multiply a BigInt by a rational and round half-up to an integer.
 *
 * @param {bigint} value
 * @param {{num: bigint, den: bigint}} rational
 * @return {bigint}
 */
export function mulRational(value, rational) {
  const product = value * rational.num;
  const den = rational.den;
  if (den <= 0n) {
    return 0n;
  }
  if (product >= 0n) {
    return (product + den / 2n) / den;
  }
  return -((-product + den / 2n) / den);
}

/**
 * Round a fractional decimal string half-up to an integer BigInt.
 * Used for aggregates like avg_connection_capacity_p.
 *
 * @param {string|number|null|undefined} decimal
 * @return {bigint|null}
 */
export function roundDecimalToBigInt(decimal) {
  const r = parseDecimalRational(decimal);
  if (!r) {
    return null;
  }
  return mulRational(1n, r);
}

/**
 * Scale a legacy display value to base units. Used only as an approximate
 * fallback when `_p` is absent.
 *
 * @param {bigint|string|number|null|undefined} displayValue
 * @param {bigint|number} exponent
 * @return {bigint|null}
 */
export function legacyToBase(displayValue, exponent) {
  const n = toBase(displayValue);
  if (n === null) {
    return null;
  }
  const exp = typeof exponent === 'bigint' ? exponent : BigInt(exponent);
  return n * (10n ** exp);
}

/**
 * Wrap a formatted quantity for approximate (legacy) values.
 *
 * @param {string} formatted
 * @param {boolean} precise
 * @return {string} HTML-safe span when approximate
 */
export function approxMarkup(formatted, precise) {
  if (precise || formatted === '—') {
    return formatted;
  }
  return `<span class="sui-quantity sui-quantity-approx" title="${APPROX_TOOLTIP}">${formatted}</span>`;
}

/**
 * Convert a ualpha BigInt to the display-unit decimal string (grams),
 * suitable for filling an input.max or MAX button. Trailing zeros trimmed.
 *
 * @param {bigint} ualpha
 * @param {bigint} [exponent=6n]
 * @return {string}
 */
export function baseToDisplayDecimal(ualpha, exponent = 6n) {
  const abs = ualpha < 0n ? -ualpha : ualpha;
  const div = 10n ** exponent;
  const int = abs / div;
  const frac = abs % div;
  const sign = ualpha < 0n ? '-' : '';
  if (frac === 0n) {
    return sign + int.toString();
  }
  const fracStr = frac.toString().padStart(Number(exponent), '0').replace(/0+$/, '');
  return `${sign}${int}.${fracStr}`;
}
