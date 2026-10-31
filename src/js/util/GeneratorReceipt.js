import {CHAIN} from "../constants/ChainConstants";
import {generatorObjectId} from "./GeneratorIntent";
import {transferAddress} from "./TransferIntent";
import {uint64} from "./ExactInteger";

/** The source is implicit in the message; obtain the actual debit from its committed event. */
export function generatorReceipt(events, protocol) {
  if (!Array.isArray(events)) throw new Error('Generator execution events unavailable');
  const found = events.filter(event=>event.type === 'structs.structs.EventAlphaInfuse');
  if (found.length !== 1 || !Array.isArray(found[0].attributes)) throw new Error('Generator execution receipt is ambiguous');
  const attributes = found[0].attributes.filter(attribute=>attribute.key === 'eventAlphaInfuseDetail');
  if (attributes.length !== 1 || typeof attributes[0].value !== 'string' || attributes[0].value.length > 4096) {
    throw new Error('Generator execution receipt is invalid');
  }
  const value = JSON.parse(attributes[0].value);
  const ownerId = generatorObjectId(value.playerId,'1');
  const primaryAddress = transferAddress(value.primaryAddress);
  if (!uint64(value.amount)) throw new Error('Generator execution amount is invalid');
  if (![CHAIN.PROTOCOL,CHAIN.LEGACY_PROTOCOL].includes(protocol)) throw new Error('Generator execution protocol unavailable');
  const source = protocol === CHAIN.PROTOCOL ? transferAddress(value.vaultAddress) : primaryAddress;
  return Object.freeze({ownerId,primaryAddress,source,amount:value.amount});
}
