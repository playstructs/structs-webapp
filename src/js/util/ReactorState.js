import {CHAIN} from "../constants/ChainConstants";
import {REACTOR_TRANSACTION} from "../constants/ReactorTransactions";
import {exactAlphaAmount} from "./ReactorIntent";
import {transferAddress} from "./TransferIntent";

const ALPHA = 1000000n;
const DECIMAL = 1000000000000000000n;

export function commissionAtoms(value) {
  if (typeof value !== 'string' || !/^(0|1)(\.[0-9]{1,18})?$/.test(value)) throw new Error('Invalid exact commission');
  const [whole, fraction = ''] = value.split('.');
  const atoms = BigInt(whole) * DECIMAL + BigInt(fraction.padEnd(18, '0'));
  if (atoms > DECIMAL) throw new Error('Commission exceeds one');
  return atoms;
}

/** The release rounds the commission per position to nearest, ties to even. */
export function reactorOwnerPower(power, commission) {
  const product = power * commissionAtoms(commission);
  let rounded = product / DECIMAL;
  const remainder = product % DECIMAL;
  if (remainder * 2n > DECIMAL || (remainder * 2n === DECIMAL && rounded % 2n)) rounded++;
  return power - rounded;
}

export function alphaDecimal(amount) {
  const fraction = (amount % ALPHA).toString().padStart(6, '0').replace(/0+$/, '');
  return `${amount / ALPHA}${fraction ? '.' + fraction : ''}`;
}

/** Native context and indexed values refer to the same boundary. BigInts stay local. */
export function reactorState(indexed, context) {
  commissionAtoms(context.commission);
  const state = {...context, funds:exactAlphaAmount(context.funds), minimum:exactAlphaAmount(context.minimum),
    positions:[], fuel:0n, ownerPower:0n};
  if (context.protocol === CHAIN.PROTOCOL) {
    if (indexed.owner_id !== context.ownerId || indexed.player_id !== context.ownerId
        || indexed.destination_id !== context.reactorId || indexed.validator !== context.validator
        || indexed.vault_address !== context.source || indexed.positions_meta?.height !== context.height
        || indexed.positions_meta.complete !== true || indexed.positions_meta.power_ready !== true
        || !Array.isArray(indexed.positions) || indexed.positions.length > 1024) throw new Error('Reactor position coverage unavailable');
    const seen = new Set();
    for (const row of indexed.positions) {
      const address = transferAddress(row.address);
      if (seen.has(address) || row.owner_id !== context.ownerId || row.validator !== context.validator
          || row.native_ready !== true || row.power_ready !== true || typeof row.is_vault !== 'boolean'
          || row.is_vault !== (address === context.source) || !Number.isSafeInteger(row.unbonding_entries)
          || row.unbonding_entries < 0) throw new Error('Invalid reactor position');
      seen.add(address);
      const fuel = exactAlphaAmount(row.fuel_p);
      const power = exactAlphaAmount(row.power_p);
      const ownerPower = exactAlphaAmount(row.owner_power_p);
      const absent = row.recorded_owner_id === null && row.stored_fuel_p === null && row.commission === null;
      if (absent ? power !== 0n || ownerPower !== 0n : ownerPower !== reactorOwnerPower(power, row.commission)) {
        throw new Error('Reactor power distribution mismatch');
      }
      state.positions.push({address, isVault:row.is_vault, fuel, ownerPower,
        available:row.unbonding_entries < context.maxEntries ? fuel : 0n});
    }
    if (!seen.has(context.source)) throw new Error('Reactor source is missing');
    state.positions.sort((a,b)=>Number(b.isVault)-Number(a.isVault)||(a.address < b.address ? -1 : a.address > b.address ? 1 : 0));
    state.fuel = exactAlphaAmount(indexed.fuel_p);
    state.ownerPower = exactAlphaAmount(indexed.owner_power_p);
    if (state.fuel !== state.positions.reduce((total,p)=>total+p.fuel,0n)
        || state.ownerPower !== state.positions.reduce((total,p)=>total+p.ownerPower,0n)) throw new Error('Reactor aggregate mismatch');
  } else {
    if (indexed.player_id !== context.ownerId || indexed.address !== context.source
        || indexed.destination_id !== context.reactorId) throw new Error('Legacy reactor source changed');
    state.fuel = exactAlphaAmount(indexed.fuel_p);
    state.ownerPower = reactorOwnerPower(exactAlphaAmount(indexed.power_p), indexed.position_commission);
    state.positions = [{address:context.source,isVault:false,fuel:state.fuel,ownerPower:state.ownerPower,
      available:exactAlphaAmount(context.legacyAvailable)}];
  }
  state.initialAlpha = state.fuel / ALPHA;
  state.maxAlpha = state.initialAlpha + state.funds / ALPHA;
  return state;
}

/** Nominal changed-position preview, not a prediction of native share rounding or diversity. */
export function reactorPreview(state, targetAlpha) {
  if (typeof targetAlpha !== 'bigint' || targetAlpha < 0n) throw new Error('Invalid reactor target');
  const delta = (targetAlpha - state.initialAlpha) * ALPHA;
  if (!delta) return state.ownerPower / 1000n;
  if (state.fuel + delta < 0n) throw new Error('Reactor target exceeds the bonded balance');
  const expectedPower = fuel => {
    const power = fuel * state.ratio;
    if (power > 18446744073709551615n) throw new Error('Reactor power exceeds its native range');
    return reactorOwnerPower(power, state.commission);
  };
  let power = state.ownerPower;
  if (delta > 0n) {
    if (delta > state.funds) throw new Error('Insufficient spendable Alpha');
    const source = state.positions.find(p=>p.address===state.source);
    power += expectedPower(source.fuel + delta) - source.ownerPower;
  } else {
    let remaining = -delta;
    for (const position of state.positions.slice(0,REACTOR_TRANSACTION.MAX_POSITIONS)) {
      if (!remaining) break;
      const amount = position.available < remaining ? position.available : remaining;
      if (!amount) continue;
      power += expectedPower(position.fuel - amount) - position.ownerPower;
      remaining -= amount;
    }
    if (remaining) throw new Error('Eligible reactor positions cannot cover the withdrawal');
  }
  return power / 1000n;
}
