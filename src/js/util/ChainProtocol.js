import {CHAIN} from "../constants/ChainConstants";

/** The installed Comet API uses Number for heights. Refuse lossy conversion. */
export function exactQueryHeight(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value)) value = String(value);
  if (typeof value !== 'string' || value.length > 16 || !/^[1-9][0-9]*$/.test(value)
      || BigInt(value) > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Unsupported or invalid chain query height');
  }
  return value;
}

export function protocolAtHeight(chainId, height) {
  if (chainId !== CHAIN.ID) throw new Error('Unsupported chain');
  return BigInt(exactQueryHeight(height)) >= BigInt(CHAIN.UPGRADE_HEIGHT) ? CHAIN.PROTOCOL : CHAIN.LEGACY_PROTOCOL;
}

/** A delayed block notification cannot make a newer verified snapshot legacy. */
export function maxQueryHeight(height, other = height) {
  const first = exactQueryHeight(height);
  const second = exactQueryHeight(other);
  return BigInt(first) > BigInt(second) ? first : second;
}

/**
 * Validate the metadata belonging to the data actually used by an action.
 * A block response alone cannot certify a separate inventory/work response.
 * This establishes protocol agreement, not live spendability or permissions.
 */
export function validateSigningSnapshot(meta, observed, requiredModels = []) {
  return validateIndexedSnapshot(meta,observed,requiredModels,true);
}

/** Data may be complete while catching up; only signing requires a current writer. */
export function validateReadSnapshot(meta, observed, requiredModels = []) {
  return validateIndexedSnapshot(meta,observed,requiredModels,false);
}

function validateIndexedSnapshot(meta, observed, requiredModels, signing) {
  const observedHeight = exactQueryHeight(observed?.height);
  const protocol = protocolAtHeight(observed?.chainId, observedHeight);
  const indexed = exactQueryHeight(meta?.indexed_height);
  const height = exactQueryHeight(meta?.height);
  const tip = exactQueryHeight(meta?.observed_tip);
  if (meta.chain_id !== observed.chainId || meta.activation_height !== CHAIN.UPGRADE_HEIGHT
      || meta.api_contract !== CHAIN.API_CONTRACT || meta.cache_epoch !== `${CHAIN.API_CONTRACT}:${protocol}`
      || meta.protocol !== protocol || meta.observed_protocol !== protocol
      || meta.data_ready !== true || (signing && meta.transaction_ready !== true) || height !== indexed
      || BigInt(indexed) > BigInt(observedHeight) || BigInt(tip) < BigInt(indexed)
      || protocolAtHeight(meta.chain_id, tip) !== protocol
      || (protocol === CHAIN.PROTOCOL && meta.inventory_authority !== 'current-claims-v1')) {
    throw new Error('Indexed data and signing protocol are not ready');
  }
  if (!Array.isArray(requiredModels) || !Array.isArray(meta.required_models)) {
    throw new Error('Required signing models are unavailable');
  }
  for (const name of requiredModels) {
    if (typeof name !== 'string' || !name || !meta.required_models.includes(name)
        || meta.models?.[name]?.ready !== true || meta.models[name].height !== height) {
      throw new Error('Required signing model is not ready');
    }
  }
  return Object.freeze({
    chainId: observed.chainId, protocol, indexedHeight: indexed, observedHeight,
    timeoutHeight: protocol === CHAIN.LEGACY_PROTOCOL ? (BigInt(CHAIN.UPGRADE_HEIGHT) - 1n).toString() : '0',
  });
}
