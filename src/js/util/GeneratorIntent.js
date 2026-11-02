import {exactAlphaAmount} from "./ReactorIntent";
import {isObjectId, uint64} from "./ExactInteger";

export function generatorObjectId(value, prefix) {
  if (!isObjectId(value,prefix)) throw new Error('Invalid generator identity');
  return value;
}

/** Preserve the chosen target and full amount; the handler resolves the source. */
export function generatorIntent(value) {
  const fields = ['kind','version','ownerId','structId','amount'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length
      || Object.keys(value).some(key=>!fields.includes(key)) || value.kind !== 'generator_fund' || value.version !== 1) {
    throw new Error('Invalid generator intent');
  }
  generatorObjectId(value.ownerId,'1');
  generatorObjectId(value.structId,'5');
  const amount = uint64(value.amount);
  if (!amount || amount % 1000000n) throw new Error('Generator funding requires positive whole Alpha');
  return Object.freeze({...value});
}
