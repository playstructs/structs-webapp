import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {STRUCTS_FREE_GAS} from "../constants/Fee";
import {protocolAtHeight} from "../util/ChainProtocol";
import {GAMEPLAY_PERMISSIONS, gameplayIntent} from "../util/GameplayIntent";
import {registrationUint64} from "../util/RegistrationProof";

export async function prepareGameplay(rpc, tx) {
  const intent=gameplayIntent(tx.intent), protocol=protocolAtHeight(rpc.chainId,rpc.height);
  const actor=await new StructsQuery(rpc).Address({address:tx.accountAddress});
  if (actor.address !== tx.accountAddress || actor.playerId !== intent.ownerId) {
    throw new Error('Gameplay signing authority changed');
  }
  const mask=registrationUint64(actor.permissions), required=GAMEPLAY_PERMISSIONS[intent.typeUrl];
  if (required !== null && (mask & BigInt(required)) !== BigInt(required)) {
    throw new Error('Signing key lacks the gameplay permission');
  }
  // Do not require target ownership here: the chain supports scoped grants.
  // SigningSubmission simulates these exact signed bytes at this height. Its
  // handler checks object authority, charge, target state and current proof
  // anchor/difficulty, including vault crediting for successful refining.
  return {protocol,message:{typeUrl:intent.typeUrl,payload:intent.payload},
    fee:{amount:[{denom:'ualpha',amount:'0'}],gas:STRUCTS_FREE_GAS},
    gameplay:{ownerId:intent.ownerId,typeUrl:intent.typeUrl,height:rpc.height}};
}
