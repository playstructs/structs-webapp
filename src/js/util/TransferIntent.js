import {fromBech32, toBech32} from "@cosmjs/encoding";

export function transferAddress(address) {
  if (typeof address!=='string') throw new Error('Transfer address is required');
  const decoded = fromBech32(address);
  if (decoded.prefix!=='structs' || decoded.data.length!==20 || toBech32(decoded.prefix,decoded.data)!==address) {
    throw new Error('Invalid transfer address');
  }
  return address;
}

/** User choices only. Protocol, source/destination and authority are resolved before signing. */
export function transferIntent(value) {
  const fields = ['kind','version','ownerId','recipientId','recipientAddress','amount'];
  if (!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).length!==fields.length
      || Object.keys(value).some(key=>!fields.includes(key)) || value.kind!=='alpha_transfer' || value.version!==1) {
    throw new Error('Invalid transfer intent');
  }
  for (const id of [value.ownerId,...(value.recipientId===null ? [] : [value.recipientId])]) {
    if (typeof id!=='string' || !/^1-[1-9][0-9]{0,19}$/.test(id) || BigInt(id.slice(2))>18446744073709551615n) {
      throw new Error('Invalid transfer player');
    }
  }
  transferAddress(value.recipientAddress);
  if (typeof value.amount!=='string' || !/^[1-9][0-9]{0,7}$/.test(value.amount)
      || BigInt(value.amount)>99000000n || BigInt(value.amount)%1000000n!==0n) {
    throw new Error('Transfer amount must be a whole Alpha from 1 through 99');
  }
  return Object.freeze({...value});
}
