import {CHAIN} from "../constants/ChainConstants";
import {protocolAtHeight} from "./ChainProtocol";
import {transferAddress} from "./TransferIntent";
import {isObjectId, uint64} from "./ExactInteger";

export function registrationProofContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || typeof value.source_height !== 'string'
      || !isObjectId(value.player_id,1)) throw new Error('Invalid registration proof context');
  transferAddress(value.address);
  const protocol = protocolAtHeight(value.chain_id,value.source_height);
  if (value.protocol !== protocol || value.registered_player_id !== '') throw new Error('Registration proof is stale or already associated');
  if (protocol === CHAIN.LEGACY_PROTOCOL) {
    if (value.proof_nonce !== null || value.timeout_height !== (BigInt(CHAIN.UPGRADE_HEIGHT)-1n).toString()) {
      throw new Error('Legacy registration requires pre-upgrade expiry');
    }
  } else {
    uint64(value.proof_nonce);
    if (value.timeout_height !== '0') throw new Error('Unexpected registration proof expiry');
  }
  return Object.freeze({chain_id:value.chain_id,protocol,source_height:value.source_height,player_id:value.player_id,
    address:value.address,proof_nonce:value.proof_nonce,registered_player_id:'',timeout_height:value.timeout_height});
}

export function registrationProofMessage(value) {
  const context = registrationProofContext(value);
  const subject = `PLAYER${context.player_id}ADDRESS${context.address}`;
  return context.protocol === CHAIN.LEGACY_PROTOCOL ? subject
    : `CHAIN${context.chain_id}|REGISTERADDRESS${subject}NONCE${context.proof_nonce}`;
}

export function pendingRegistrationProof(row) {
  return registrationProofContext({chain_id:row.proof_chain_id,protocol:row.proof_protocol,source_height:row.proof_height,
    player_id:row.player_id,address:row.address,proof_nonce:row.proof_nonce,
    registered_player_id:'',timeout_height:row.proof_timeout_height});
}
