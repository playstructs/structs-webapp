import {CHAIN} from "../constants/ChainConstants";
import {uint64} from "./ExactInteger";

/** Work rows may carry small values as JSON numbers; those are exact when safe. */
export function workUint64(value) {
  return uint64(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : value);
}

/** structsd v0.22.0 types.CalculateDifficulty, bounded to 63 integer products. */
export function integerWorkDifficulty(age, range) {
  age=workUint64(age);range=workUint64(range);
  if (age<=1n || range<=1n) return 64;
  const ceiling=age**63n;
  let power=1n, exponent=0;
  for (let k=1;k<=63;k++) {
    power*=range;
    if (power>ceiling) break;
    exponent=k;
  }
  return 64-exponent;
}

/** Only an observed chain height can make a proof eligible. */
export function workDifficultyAtHeight(start, range, height) {
  const anchor=workUint64(start), current=workUint64(height), base=workUint64(range);
  if (anchor===0n || current<anchor) return 64;
  const age=current-anchor;
  if (current>=BigInt(CHAIN.UPGRADE_HEIGHT)) return integerWorkDifficulty(String(age),String(base));
  if (age<=1n || base<=1n) return 64;
  return Math.max(1,64-Math.floor(Math.log10(Number(age))/Math.log10(Number(base))*63));
}

export function hashDifficulty(hash) {
  if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid work hash');
  return hash.match(/^0*/)[0].length;
}
