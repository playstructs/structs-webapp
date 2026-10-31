import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {protocolAtHeight, exactQueryHeight} from "./ChainProtocol";
import {transferAddress} from "./TransferIntent";
import {isObjectId, uint64} from "./ExactInteger";

export const DEVICE_PERMISSION_MASK = BigInt(
  PERMISSIONS.ADMIN | PERMISSIONS.UPDATE | PERMISSIONS.DELETE | PERMISSIONS.ASSETS_ALL
);

/**
 * Change only the two groups exposed by the existing device controls.
 *
 * @param {string} current
 * @param {boolean} manageDevices
 * @param {boolean} transferAssets
 * @return {string}
 */
export function selectedDevicePermissions(current, manageDevices, transferAssets) {
  if (typeof manageDevices !== 'boolean' || typeof transferAssets !== 'boolean') {
    throw new Error('Invalid device permission selection');
  }
  const manage = BigInt(PERMISSIONS.ADMIN | PERMISSIONS.UPDATE | PERMISSIONS.DELETE);
  return (
    (uint64(current) & ~DEVICE_PERMISSION_MASK)
    | (manageDevices ? manage : 0n)
    | (transferAssets ? BigInt(PERMISSIONS.ASSETS_ALL) : 0n)
  ).toString();
}

/**
 * @param {object} value
 * @return {Readonly<object>}
 */
export function deviceChangeContext(value) {
  if (
    !value
    || typeof value !== 'object'
    || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== 'chain_id,proof_nonce,protocol,source_height'
  ) {
    throw new Error('Invalid device context');
  }
  const height = exactQueryHeight(value.source_height);
  const protocol = protocolAtHeight(value.chain_id, height);
  if (typeof value.source_height !== 'string' || value.protocol !== protocol) {
    throw new Error('Invalid device context protocol');
  }
  if (protocol === CHAIN.PROTOCOL) {
    uint64(value.proof_nonce);
  } else if (value.proof_nonce !== null) {
    throw new Error('Legacy device context has no nonce');
  }
  return Object.freeze({...value});
}

/**
 * Consent selects one address lifetime; an unsigned retry cannot change its owner or mask.
 *
 * @param {object} value
 * @return {Readonly<object>}
 */
export function deviceChangeIntent(value) {
  const fields = ['kind', 'version', 'ownerId', 'address', 'operation', 'permissions', 'expectedPermissions', 'context'];
  if (
    !value
    || typeof value !== 'object'
    || Array.isArray(value)
    || Object.keys(value).length !== fields.length
    || Object.keys(value).some(key => !fields.includes(key))
    || value.kind !== 'device_change'
    || value.version !== 1
    || !['permissions', 'revoke'].includes(value.operation)
    || !isObjectId(value.ownerId, 1)
  ) {
    throw new Error('Invalid device change');
  }
  transferAddress(value.address);
  if (value.operation === 'permissions') {
    uint64(value.permissions);
    uint64(value.expectedPermissions);
  } else if (value.permissions !== null || value.expectedPermissions !== null) {
    throw new Error('Revocation does not select a permission mask');
  }
  return Object.freeze({...value, context: deviceChangeContext(value.context)});
}
