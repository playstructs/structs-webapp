import {fromHex, toBech32, toUtf8} from "@cosmjs/encoding";
import {sha256, ripemd160, Secp256k1, Secp256k1Signature} from "@cosmjs/crypto";
import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {CHAIN} from "../constants/ChainConstants";
import {STRUCTS_FREE_GAS} from "../constants/Fee";
import {protocolAtHeight} from "../util/ChainProtocol";
import {registrationIntent} from "../util/RegistrationIntent";
import {registrationProofMessage} from "../util/RegistrationProof";
import {uint64} from "../util/ExactInteger";

export async function prepareRegistration(rpc, tx) {
  const intent = registrationIntent(tx.intent);
  const protocol = protocolAtHeight(rpc.chainId,rpc.height);
  if (protocol !== intent.proof.protocol || BigInt(rpc.height) < BigInt(intent.proof.source_height)) {
    throw new Error('Registration proof protocol or height changed');
  }
  const query = new StructsQuery(rpc);
  const actor = await query.Address({address:tx.accountAddress});
  const permissions = uint64(intent.permissions);
  if (actor.address !== tx.accountAddress || actor.playerId !== intent.ownerId
      || (uint64(actor.permissions) & permissions) !== permissions) {
    throw new Error('Signing address cannot grant the requested device permissions');
  }
  if ((await query.Player({id:intent.ownerId})).Player?.id !== intent.ownerId) throw new Error('Registration player is unavailable');
  const target = await query.Address({address:intent.address});
  const owner = protocol === CHAIN.LEGACY_PROTOCOL && target.playerId === '1-0' ? '' : target.playerId;
  if (target.address !== intent.address || owner !== ''
      || (protocol === CHAIN.PROTOCOL && target.proofNonce !== intent.proof.proof_nonce)) {
    throw new Error('Registration proof nonce or ownership changed');
  }
  const publicKey = fromHex(intent.pubkey);
  if (toBech32('structs',ripemd160(sha256(publicKey))) !== intent.address
      || !await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(fromHex(intent.signature).slice(0,64)),
        sha256(toUtf8(registrationProofMessage(intent.proof))),publicKey)) throw new Error('Invalid device consent signature');
  return {protocol,message:{typeUrl:'/structs.structs.MsgAddressRegister',payload:{playerId:intent.ownerId,address:intent.address,
    proofPubKey:intent.pubkey,proofSignature:intent.signature,permissions:intent.permissions}},
    fee:{amount:[{denom:'ualpha',amount:'0'}],gas:STRUCTS_FREE_GAS},
    registration:{playerId:intent.ownerId,address:intent.address,permissions:intent.permissions,proof:intent.proof,height:rpc.height}};
}
