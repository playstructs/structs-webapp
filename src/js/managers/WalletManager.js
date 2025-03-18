import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {Bip39, Random} from "@cosmjs/crypto";

export class WalletManager {

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
}