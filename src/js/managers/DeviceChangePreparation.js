import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {STRUCTS_FREE_GAS} from "../constants/Fee";
import {protocolAtHeight} from "../util/ChainProtocol";
import {deviceChangeContext, deviceChangeIntent} from "../util/DeviceChangeIntent";
import {registrationUint64} from "../util/RegistrationProof";

/** Capture the address lifetime when the user chooses the operation. */
export async function readDeviceContext(rpc, ownerId, address) {
  const target=await readDeviceAuthority(rpc,address);
  if (target.playerId !== ownerId) throw new Error('Device ownership changed');
  const protocol=protocolAtHeight(rpc.chainId,rpc.height);
  return deviceChangeContext({chain_id:rpc.chainId,protocol,source_height:rpc.height,
    proof_nonce:protocol === CHAIN.PROTOCOL ? target.proofNonce : null});
}

export async function readDeviceAuthority(rpc, address) {
  protocolAtHeight(rpc.chainId,rpc.height);
  const target=await new StructsQuery(rpc).Address({address});
  if (target.address !== address) throw new Error('Device identity changed');
  registrationUint64(target.permissions);
  return target;
}

export async function prepareDeviceChange(rpc, tx) {
  const intent=deviceChangeIntent(tx.intent), protocol=protocolAtHeight(rpc.chainId,rpc.height);
  if (protocol !== intent.context.protocol || BigInt(rpc.height) < BigInt(intent.context.source_height)) {
    throw new Error('Device change protocol or height changed');
  }
  const query=new StructsQuery(rpc);
  const actor=await query.Address({address:tx.accountAddress});
  const target=tx.accountAddress === intent.address ? actor : await query.Address({address:intent.address});
  if (actor.address !== tx.accountAddress || actor.playerId !== intent.ownerId
      || target.address !== intent.address || target.playerId !== intent.ownerId
      || (protocol === CHAIN.PROTOCOL && target.proofNonce !== intent.context.proof_nonce)) {
    throw new Error('Device signing authority or target lifetime changed');
  }
  const player=(await query.Player({id:intent.ownerId})).Player;
  if (player?.id !== intent.ownerId || !player.primaryAddress) throw new Error('Device owner is unavailable');
  const actorMask=registrationUint64(actor.permissions), targetMask=registrationUint64(target.permissions);
  let message;
  if (intent.operation === 'permissions') {
    const desired=registrationUint64(intent.permissions);
    if (target.permissions !== intent.expectedPermissions) throw new Error('Device permissions changed since they were displayed');
    const required=targetMask | desired;
    if ((actorMask & required) !== required) throw new Error('Signing key must hold both existing and replacement permissions');
    if (player.primaryAddress === intent.address && (desired & BigInt(PERMISSIONS.ALL)) !== BigInt(PERMISSIONS.ALL)) {
      throw new Error('Primary device must retain full access');
    }
    message={typeUrl:'/structs.structs.MsgPermissionSetOnAddress',payload:{address:intent.address,permissions:intent.permissions}};
  } else {
    if ((actorMask & BigInt(PERMISSIONS.DELETE)) === 0n) throw new Error('Signing key cannot revoke devices');
    if (player.primaryAddress === intent.address) throw new Error('Primary device cannot be revoked');
    // A compromised target changing its grant must not prevent its revocation.
    message={typeUrl:'/structs.structs.MsgAddressRevoke',payload:{address:intent.address}};
  }
  return {protocol,message,fee:{amount:[{denom:'ualpha',amount:'0'}],gas:STRUCTS_FREE_GAS},
    deviceChange:{ownerId:intent.ownerId,address:intent.address,operation:intent.operation,permissions:intent.permissions,
      proofNonce:intent.context.proof_nonce,height:rpc.height}};
}
