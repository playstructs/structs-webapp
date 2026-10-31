import schemas from "../ts/structs.structs/message-schemas.json";
import {UINT64_MAX} from "./ExactInteger";

const INT64_MAX = 9223372036854775807n;
const INT64_MIN = -9223372036854775808n;

/** Keep exact wire integers JSON-safe. An already rounded Number is unrecoverable. */
function integer64(value, unsigned, field) {
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    value = String(value);
  }
  if (typeof value !== 'string' || value.length > 20 || !/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(value)) {
    throw new Error(`Invalid exact integer at ${field}`);
  }
  const number = BigInt(value);
  if (number < (unsigned ? 0n : INT64_MIN) || number > (unsigned ? UINT64_MAX : INT64_MAX)) {
    throw new Error(`Integer outside wire range at ${field}`);
  }
  return value;
}

function decimalAtoms(value, field) {
  if (typeof value !== 'string' || value.length > 98 || !/^-?(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(value)) {
    throw new Error(`Expected exact decimal with at most 18 places at ${field}`);
  }
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  const atoms = BigInt(whole) * 1000000000000000000n + BigInt(fraction.padEnd(18, '0'));
  if (atoms >= (1n << 256n) * 1000000000000000000n) {
    throw new Error(`Decimal outside SDK range at ${field}`);
  }
  return (negative ? -atoms : atoms).toString();
}

/** Decode a custom LegacyDec protobuf string without passing through Number. */
export function legacyDecimalFromWire(value) {
  if (typeof value !== 'string' || value.length > 98 || !/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(value)) {
    throw new Error('Invalid LegacyDec wire integer');
  }
  const negative = value.startsWith('-');
  const atoms = BigInt(negative ? value.slice(1) : value);
  if (atoms >= (1n << 256n) * 1000000000000000000n) throw new Error('LegacyDec outside SDK range');
  const whole = atoms / 1000000000000000000n;
  const fraction = (atoms % 1000000000000000000n).toString().padStart(18, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}${fraction ? '.' + fraction : ''}`;
}

/**
 * Normalize the actual request schema before persistence and again on reload.
 * Generated fromPartial methods do not validate runtime JS objects or reject
 * unknown fields, and a field silently dropped there never reaches the chain.
 */
export function normalizeMessagePayload(typeUrl, payload) {
  const schema = schemas[typeUrl];
  if (!schema) {
    if (typeUrl.startsWith('/structs.structs.')) {
      throw new Error(`Unknown Structs request ${typeUrl}`);
    }
    return payload;
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`Expected message object for ${typeUrl}`);
  }
  const result = {};
  for (const [name, value] of Object.entries(payload)) {
    const field = schema[name];
    if (!Object.hasOwn(schema, name)) throw new Error(`Unknown field ${typeUrl}.${name}`);
    const convert = item => {
      if (field.legacyDecimal) {
        decimalAtoms(item, name);
        return item;
      }
      if (['uint64', 'fixed64'].includes(field.type)) return integer64(item, true, name);
      if (['int64', 'sint64', 'sfixed64'].includes(field.type)) return integer64(item, false, name);
      if (field.type === 'message') return normalizeMessagePayload(field.message, item);
      if (field.type === 'string' && typeof item !== 'string') throw new Error(`Expected string at ${name}`);
      if (field.type === 'bool' && typeof item !== 'boolean') throw new Error(`Expected boolean at ${name}`);
      if (['uint32', 'fixed32', 'int32', 'sint32', 'sfixed32', 'enum'].includes(field.type)) {
        const unsigned = field.type === 'uint32' || field.type === 'fixed32';
        if (!Number.isInteger(item) || item < (unsigned ? 0 : -2147483648) || item > (unsigned ? 4294967295 : 2147483647)) {
          throw new Error(`Invalid 32-bit value at ${name}`);
        }
      }
      return item;
    };
    if (field.repeated) {
      if (!Array.isArray(value)) throw new Error(`Expected array at ${name}`);
      result[name] = value.map(convert);
    } else {
      result[name] = convert(value);
    }
  }
  return result;
}

/** LegacyDec's protobuf string is its scaled integer, unlike its JSON decimal. */
export function messagePayloadToWire(typeUrl, payload) {
  const result = normalizeMessagePayload(typeUrl, payload);
  const schema = schemas[typeUrl];
  if (!schema) return result;
  for (const [name, value] of Object.entries(result)) {
    const field = schema[name];
    const convert = item => field.legacyDecimal ? decimalAtoms(item, name)
      : field.type === 'message' ? messagePayloadToWire(field.message, item) : item;
    result[name] = field.repeated ? value.map(convert) : convert(value);
  }
  return result;
}
