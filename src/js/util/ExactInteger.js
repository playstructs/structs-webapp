export const UINT64_MAX = 18446744073709551615n;

/**
 * @param {*} value
 * @return {boolean} true for a canonical decimal string within uint64
 */
export function isUint64(value) {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(value) && BigInt(value) <= UINT64_MAX;
}

/**
 * @param {string} value canonical decimal string
 * @return {bigint}
 */
export function uint64(value) {
  if (!isUint64(value)) throw new Error('Expected an exact uint64');
  return BigInt(value);
}

/**
 * @param {*} value
 * @param {number|string} type object type prefix, e.g. 1 for players
 * @return {boolean} true for "<type>-<index>" with a nonzero uint64 index
 */
export function isObjectId(value, type) {
  const prefix = `${type}-`;
  return typeof value === 'string' && value.startsWith(prefix)
    && /^[1-9][0-9]{0,19}$/.test(value.slice(prefix.length)) && BigInt(value.slice(prefix.length)) <= UINT64_MAX;
}
