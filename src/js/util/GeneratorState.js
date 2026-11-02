import {generatorObjectId} from "./GeneratorIntent";
import {exactAlphaAmount} from "./ReactorIntent";
import {commissionAtoms} from "./ReactorState";
import {transferAddress} from "./TransferIntent";
import {UINT64_MAX, uint64} from "./ExactInteger";

const ALPHA = 1000000n;

/** Stored output can differ from fuel times today's rate while work is deferred. */
export function generatorState(indexed, context) {
  generatorObjectId(context.ownerId,'1');
  generatorObjectId(context.structId,'5');
  transferAddress(context.source);
  if (indexed?.struct_id !== context.structId || indexed.source_address !== context.source
      || indexed.snapshot_meta?.height !== context.height || indexed.positions_ready !== true
      || typeof indexed.source_exists !== 'boolean') throw new Error('Generator position coverage unavailable');
  const state = {...context,funds:exactAlphaAmount(context.funds),rate:uint64(context.rate),
    fuel:exactAlphaAmount(indexed.fuel_p),power:exactAlphaAmount(indexed.power_p),sourceFuel:0n,sourcePower:0n};
  if (indexed.source_exists) {
    const fuel = uint64(indexed.source_fuel_p),power = uint64(indexed.source_power_p);
    const ratio = uint64(indexed.source_ratio_p);
    commissionAtoms(indexed.source_commission);
    if (typeof indexed.source_generator_disabled !== 'boolean' || fuel * ratio > UINT64_MAX
        || power !== (indexed.source_generator_disabled ? 0n : fuel * ratio)
        || fuel > state.fuel || power > state.power) throw new Error('Generator stored power is inconsistent');
    state.sourceFuel = fuel;state.sourcePower = power;
  } else if (['source_fuel_p','source_power_p','source_ratio_p','source_commission','source_generator_disabled','source_recorded_owner_id']
      .some(field=>indexed[field] !== null)) throw new Error('Absent generator position has values');
  const fuelLimit = UINT64_MAX - state.sourceFuel;
  const powerLimit = state.rate ? UINT64_MAX / state.rate - state.sourceFuel : fuelLimit;
  const limit = [state.funds,fuelLimit,powerLimit].reduce((a,b)=>a<b?a:b);
  // Every native-valid whole-Alpha generator amount fits exactly in Number,
  // so the existing number input/stepper can retain its presentation.
  state.maxAlpha = (limit > 0n ? limit / ALPHA : 0n).toString();
  return state;
}

/** Only the selected position is re-priced; untouched positions keep applied power. */
export function generatorPreview(state, alpha) {
  if (typeof alpha !== 'bigint' || alpha < 0n) throw new Error('Invalid generator amount');
  if (!alpha) return state.power / 1000n;
  if (alpha > BigInt(state.maxAlpha)) throw new Error('Generator amount exceeds available funds or native range');
  const fuel = state.sourceFuel + alpha * ALPHA;
  return (state.power - state.sourcePower + fuel * state.rate) / 1000n;
}
