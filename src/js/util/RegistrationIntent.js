import {registrationProofContext} from "./RegistrationProof";
import {uint64} from "./ExactInteger";

/** Consent is immutable: refreshing a burned nonce requires the new device to sign again. */
export function registrationIntent(value) {
  const fields = ['kind','version','ownerId','address','pubkey','signature','permissions','proof'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length
      || Object.keys(value).some(key=>!fields.includes(key)) || value.kind !== 'address_register' || value.version !== 1) {
    throw new Error('Invalid registration intent');
  }
  const proof = registrationProofContext(value.proof);
  if (value.ownerId !== proof.player_id || value.address !== proof.address
      || typeof value.pubkey !== 'string' || !/^(02|03)[0-9a-f]{64}$/.test(value.pubkey)
      || typeof value.signature !== 'string' || !/^[0-9a-f]{128}([0-9a-f]{2})?$/.test(value.signature)) {
    throw new Error('Invalid registration consent');
  }
  uint64(value.permissions);
  return Object.freeze({...value,proof});
}
