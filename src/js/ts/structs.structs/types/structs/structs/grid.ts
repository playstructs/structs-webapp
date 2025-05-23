// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               unknown
// source: structs/structs/grid.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "structs.structs";

export interface GridRecord {
  attributeId: string;
  value: number;
}

export interface GridAttributes {
  ore: number;
  fuel: number;
  capacity: number;
  load: number;
  structsLoad: number;
  power: number;
  connectionCapacity: number;
  connectionCount: number;
  allocationPointerStart: number;
  allocationPointerEnd: number;
  proxyNonce: number;
  lastAction: number;
  nonce: number;
  ready: number;
  checkpointBlock: number;
}

function createBaseGridRecord(): GridRecord {
  return { attributeId: "", value: 0 };
}

export const GridRecord: MessageFns<GridRecord> = {
  encode(message: GridRecord, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.attributeId !== "") {
      writer.uint32(10).string(message.attributeId);
    }
    if (message.value !== 0) {
      writer.uint32(16).uint64(message.value);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): GridRecord {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGridRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.attributeId = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.value = longToNumber(reader.uint64());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GridRecord {
    return {
      attributeId: isSet(object.attributeId) ? globalThis.String(object.attributeId) : "",
      value: isSet(object.value) ? globalThis.Number(object.value) : 0,
    };
  },

  toJSON(message: GridRecord): unknown {
    const obj: any = {};
    if (message.attributeId !== "") {
      obj.attributeId = message.attributeId;
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GridRecord>, I>>(base?: I): GridRecord {
    return GridRecord.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GridRecord>, I>>(object: I): GridRecord {
    const message = createBaseGridRecord();
    message.attributeId = object.attributeId ?? "";
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseGridAttributes(): GridAttributes {
  return {
    ore: 0,
    fuel: 0,
    capacity: 0,
    load: 0,
    structsLoad: 0,
    power: 0,
    connectionCapacity: 0,
    connectionCount: 0,
    allocationPointerStart: 0,
    allocationPointerEnd: 0,
    proxyNonce: 0,
    lastAction: 0,
    nonce: 0,
    ready: 0,
    checkpointBlock: 0,
  };
}

export const GridAttributes: MessageFns<GridAttributes> = {
  encode(message: GridAttributes, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.ore !== 0) {
      writer.uint32(8).uint64(message.ore);
    }
    if (message.fuel !== 0) {
      writer.uint32(16).uint64(message.fuel);
    }
    if (message.capacity !== 0) {
      writer.uint32(24).uint64(message.capacity);
    }
    if (message.load !== 0) {
      writer.uint32(32).uint64(message.load);
    }
    if (message.structsLoad !== 0) {
      writer.uint32(40).uint64(message.structsLoad);
    }
    if (message.power !== 0) {
      writer.uint32(48).uint64(message.power);
    }
    if (message.connectionCapacity !== 0) {
      writer.uint32(56).uint64(message.connectionCapacity);
    }
    if (message.connectionCount !== 0) {
      writer.uint32(64).uint64(message.connectionCount);
    }
    if (message.allocationPointerStart !== 0) {
      writer.uint32(72).uint64(message.allocationPointerStart);
    }
    if (message.allocationPointerEnd !== 0) {
      writer.uint32(80).uint64(message.allocationPointerEnd);
    }
    if (message.proxyNonce !== 0) {
      writer.uint32(88).uint64(message.proxyNonce);
    }
    if (message.lastAction !== 0) {
      writer.uint32(96).uint64(message.lastAction);
    }
    if (message.nonce !== 0) {
      writer.uint32(104).uint64(message.nonce);
    }
    if (message.ready !== 0) {
      writer.uint32(112).uint64(message.ready);
    }
    if (message.checkpointBlock !== 0) {
      writer.uint32(120).uint64(message.checkpointBlock);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): GridAttributes {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGridAttributes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.ore = longToNumber(reader.uint64());
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.fuel = longToNumber(reader.uint64());
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.capacity = longToNumber(reader.uint64());
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.load = longToNumber(reader.uint64());
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.structsLoad = longToNumber(reader.uint64());
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.power = longToNumber(reader.uint64());
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }

          message.connectionCapacity = longToNumber(reader.uint64());
          continue;
        }
        case 8: {
          if (tag !== 64) {
            break;
          }

          message.connectionCount = longToNumber(reader.uint64());
          continue;
        }
        case 9: {
          if (tag !== 72) {
            break;
          }

          message.allocationPointerStart = longToNumber(reader.uint64());
          continue;
        }
        case 10: {
          if (tag !== 80) {
            break;
          }

          message.allocationPointerEnd = longToNumber(reader.uint64());
          continue;
        }
        case 11: {
          if (tag !== 88) {
            break;
          }

          message.proxyNonce = longToNumber(reader.uint64());
          continue;
        }
        case 12: {
          if (tag !== 96) {
            break;
          }

          message.lastAction = longToNumber(reader.uint64());
          continue;
        }
        case 13: {
          if (tag !== 104) {
            break;
          }

          message.nonce = longToNumber(reader.uint64());
          continue;
        }
        case 14: {
          if (tag !== 112) {
            break;
          }

          message.ready = longToNumber(reader.uint64());
          continue;
        }
        case 15: {
          if (tag !== 120) {
            break;
          }

          message.checkpointBlock = longToNumber(reader.uint64());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GridAttributes {
    return {
      ore: isSet(object.ore) ? globalThis.Number(object.ore) : 0,
      fuel: isSet(object.fuel) ? globalThis.Number(object.fuel) : 0,
      capacity: isSet(object.capacity) ? globalThis.Number(object.capacity) : 0,
      load: isSet(object.load) ? globalThis.Number(object.load) : 0,
      structsLoad: isSet(object.structsLoad) ? globalThis.Number(object.structsLoad) : 0,
      power: isSet(object.power) ? globalThis.Number(object.power) : 0,
      connectionCapacity: isSet(object.connectionCapacity) ? globalThis.Number(object.connectionCapacity) : 0,
      connectionCount: isSet(object.connectionCount) ? globalThis.Number(object.connectionCount) : 0,
      allocationPointerStart: isSet(object.allocationPointerStart)
        ? globalThis.Number(object.allocationPointerStart)
        : 0,
      allocationPointerEnd: isSet(object.allocationPointerEnd) ? globalThis.Number(object.allocationPointerEnd) : 0,
      proxyNonce: isSet(object.proxyNonce) ? globalThis.Number(object.proxyNonce) : 0,
      lastAction: isSet(object.lastAction) ? globalThis.Number(object.lastAction) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      ready: isSet(object.ready) ? globalThis.Number(object.ready) : 0,
      checkpointBlock: isSet(object.checkpointBlock) ? globalThis.Number(object.checkpointBlock) : 0,
    };
  },

  toJSON(message: GridAttributes): unknown {
    const obj: any = {};
    if (message.ore !== 0) {
      obj.ore = Math.round(message.ore);
    }
    if (message.fuel !== 0) {
      obj.fuel = Math.round(message.fuel);
    }
    if (message.capacity !== 0) {
      obj.capacity = Math.round(message.capacity);
    }
    if (message.load !== 0) {
      obj.load = Math.round(message.load);
    }
    if (message.structsLoad !== 0) {
      obj.structsLoad = Math.round(message.structsLoad);
    }
    if (message.power !== 0) {
      obj.power = Math.round(message.power);
    }
    if (message.connectionCapacity !== 0) {
      obj.connectionCapacity = Math.round(message.connectionCapacity);
    }
    if (message.connectionCount !== 0) {
      obj.connectionCount = Math.round(message.connectionCount);
    }
    if (message.allocationPointerStart !== 0) {
      obj.allocationPointerStart = Math.round(message.allocationPointerStart);
    }
    if (message.allocationPointerEnd !== 0) {
      obj.allocationPointerEnd = Math.round(message.allocationPointerEnd);
    }
    if (message.proxyNonce !== 0) {
      obj.proxyNonce = Math.round(message.proxyNonce);
    }
    if (message.lastAction !== 0) {
      obj.lastAction = Math.round(message.lastAction);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.ready !== 0) {
      obj.ready = Math.round(message.ready);
    }
    if (message.checkpointBlock !== 0) {
      obj.checkpointBlock = Math.round(message.checkpointBlock);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GridAttributes>, I>>(base?: I): GridAttributes {
    return GridAttributes.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GridAttributes>, I>>(object: I): GridAttributes {
    const message = createBaseGridAttributes();
    message.ore = object.ore ?? 0;
    message.fuel = object.fuel ?? 0;
    message.capacity = object.capacity ?? 0;
    message.load = object.load ?? 0;
    message.structsLoad = object.structsLoad ?? 0;
    message.power = object.power ?? 0;
    message.connectionCapacity = object.connectionCapacity ?? 0;
    message.connectionCount = object.connectionCount ?? 0;
    message.allocationPointerStart = object.allocationPointerStart ?? 0;
    message.allocationPointerEnd = object.allocationPointerEnd ?? 0;
    message.proxyNonce = object.proxyNonce ?? 0;
    message.lastAction = object.lastAction ?? 0;
    message.nonce = object.nonce ?? 0;
    message.ready = object.ready ?? 0;
    message.checkpointBlock = object.checkpointBlock ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(int64: { toString(): string }): number {
  const num = globalThis.Number(int64.toString());
  if (num > globalThis.Number.MAX_SAFE_INTEGER) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  if (num < globalThis.Number.MIN_SAFE_INTEGER) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return num;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
