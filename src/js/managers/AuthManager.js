import {PlayerCreatedListener} from "../grass_listeners/PlayerCreatedListener";

export class AuthManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildApi
   * @param {WalletManager} walletManager
   * @param {GrassManager} grassManager
   */
  constructor(
    gameState,
    guildApi,
    walletManager,
    grassManager
  ) {
    this.gameState = gameState;
    this.guildApi = guildApi;
    this.walletManager = walletManager;
    this.grassManager = grassManager;
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<boolean>}
   */
  async signup(mnemonic) {
    const wallet = await this.walletManager.createWallet(mnemonic);
    const accounts = await wallet.getAccountsWithPrivkeys();
    const account = accounts[0];

    this.gameState.signupRequest.pubkey = this.walletManager.bytesToHex(account.pubkey);
    this.gameState.signupRequest.primary_address = account.address;
    this.gameState.signupRequest.guild_id = this.gameState.thisGuild.id;

    const message = this.guildApi.buildGuildMembershipJoinProxyMessage(
      this.gameState.signupRequest.guild_id,
      this.gameState.signupRequest.primary_address,
      0
    );

    this.gameState.signupRequest.signature = await this.walletManager.createSignatureForProxyMessage(message, account.privkey);

    const playerCreatedListener = new PlayerCreatedListener();
    playerCreatedListener.guildId = this.gameState.signupRequest.guild_id;
    playerCreatedListener.playerAddress = this.gameState.signupRequest.primary_address;

    this.grassManager.registerListener(playerCreatedListener);

    const response = await this.guildApi.signup(this.gameState.signupRequest);

    return response.success;
  }

}