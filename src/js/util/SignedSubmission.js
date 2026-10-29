import {fromBase64, toBase64, toHex, toBech32} from "@cosmjs/encoding";
import {sha256, ripemd160, Secp256k1, Secp256k1Signature} from "@cosmjs/crypto";
import {AuthInfo, SignDoc, TxBody, TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {PubKey} from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import {CHAIN} from "../constants/ChainConstants";

export function transactionHash(bytes) {
  return toHex(sha256(bytes)).toUpperCase();
}

export function submissionBytes(submission) {
  if (submission?.chainId !== CHAIN.ID || typeof submission.bytes !== 'string'
      || submission.bytes.length > 1400000 || !/^[A-F0-9]{64}$/.test(submission.hash ?? '')) {
    throw new Error('Invalid signed submission identity');
  }
  const bytes = fromBase64(submission.bytes);
  if (toBase64(bytes)!==submission.bytes || transactionHash(bytes)!==submission.hash) {
    throw new Error('Signed submission hash mismatch');
  }
  return bytes;
}

/** Verify wallet output against the intended body, signer, fee and sign doc. */
export async function signedSubmission(raw, {messages, registry, fee, accountAddress, accountNumber, sequence, context}) {
  const body = TxBody.decode(raw.bodyBytes);
  const expected = messages.map(message=>({typeUrl:message.typeUrl,value:registry.encode(message)}));
  if (body.memo!=='' || body.timeoutHeight.toString()!==context.timeoutHeight
      || body.extensionOptions.length || body.nonCriticalExtensionOptions.length
      || body.messages.length!==expected.length
      || body.messages.some((message,i)=>message.typeUrl!==expected[i].typeUrl || toBase64(message.value)!==toBase64(expected[i].value))) {
    throw new Error('Wallet changed the intended transaction body');
  }
  const auth = AuthInfo.decode(raw.authInfoBytes);
  const signer = auth.signerInfos[0];
  if (auth.signerInfos.length!==1 || signer.sequence.toString()!==String(sequence)
      || signer.modeInfo?.single?.mode!==1 || signer.publicKey?.typeUrl!=='/cosmos.crypto.secp256k1.PubKey'
      || auth.fee?.gasLimit.toString()!==fee.gas || auth.fee.payer || auth.fee.granter
      || JSON.stringify(auth.fee.amount)!==JSON.stringify(fee.amount) || raw.signatures.length!==1) {
    throw new Error('Wallet changed the intended signing authority or fee');
  }
  const publicKey = PubKey.decode(signer.publicKey.value).key;
  if (toBech32('structs',ripemd160(sha256(publicKey)))!==accountAddress) throw new Error('Signed transaction has the wrong signer');
  const signDoc = SignDoc.fromPartial({bodyBytes:raw.bodyBytes,authInfoBytes:raw.authInfoBytes,
    chainId:context.chainId,accountNumber:BigInt(accountNumber)});
  if (!await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(raw.signatures[0]),sha256(SignDoc.encode(signDoc).finish()),publicKey)) {
    throw new Error('Transaction signature does not match its chain/account context');
  }
  const bytes = TxRaw.encode(raw).finish();
  const result = {...context,accountNumber:String(accountNumber),sequence:String(sequence),
    hash:transactionHash(bytes),bytes:toBase64(bytes)};
  submissionBytes(result);
  return result;
}
