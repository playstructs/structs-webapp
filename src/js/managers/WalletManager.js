import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {Bip39, Random, Secp256k1, sha256} from "@cosmjs/crypto";

export class WalletManager {

  constructor() {
    this.textEncoder = new TextEncoder();
  }

  /**
   * @return {string}
   */
  createMnemonic() {
    const getNewRandom = Random.getBytes(16);
    return Bip39.encode(getNewRandom).toString();
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<DirectSecp256k1HdWallet>}
   */
  async createWallet(mnemonic) {
    return await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      {
        prefix: "structs"
      }
    );
  }

  /**
   * @param {string} message
   * @param {Uint8Array} privateKey
   * @return {Promise<string>}
   */
  async createSignatureForProxyMessage(message, privateKey) {
    const encodedMessage = this.textEncoder.encode(message);
    const digest = sha256(encodedMessage);
    const rawSignature = await Secp256k1.createSignature(digest, privateKey);
    return this.bytesToHex(rawSignature.toFixedLength());
  }

  /**
   * @param byteArray
   * @return {string}
   */
  bytesToHex(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
}