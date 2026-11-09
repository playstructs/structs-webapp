const BIGINT_TAG = '__bigint';

/**
 * JSON.stringify that encodes BigInt as a tagged object so it survives a
 * round trip through localStorage.
 *
 * @param {*} value
 * @return {string}
 */
export function stringifyWithBigInt(value) {
  return JSON.stringify(value, (key, v) => typeof v === 'bigint' ? {[BIGINT_TAG]: v.toString()} : v);
}

/**
 * @param {string|null} json
 * @return {*}
 */
export function parseWithBigInt(json) {
  return JSON.parse(json, (key, v) => {
    if (v && typeof v === 'object' && Object.keys(v).length === 1 && typeof v[BIGINT_TAG] === 'string') {
      return BigInt(v[BIGINT_TAG]);
    }
    return v;
  });
}
