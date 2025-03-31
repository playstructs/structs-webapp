import {PlayerCreatedListener} from "../grass_listeners/PlayerCreatedListener";
import {LoginRequestDTO} from "../dtos/LoginRequestDTO";

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
    this.gameState.wallet = await this.walletManager.createWallet(mnemonic);
    const accounts = await this.gameState.wallet.getAccountsWithPrivkeys();
    this.gameState.signingAccount = accounts[0];
    this.gameState.pubkey = this.walletManager.bytesToHex(this.gameState.signingAccount.pubkey)

    this.gameState.signupRequest.pubkey = this.gameState.pubkey;
    this.gameState.signupRequest.primary_address = this.gameState.signingAccount.address;
    this.gameState.signupRequest.guild_id = this.gameState.thisGuild.id;

    const message = this.guildApi.buildGuildMembershipJoinProxyMessage(
      this.gameState.signupRequest.guild_id,
      this.gameState.signupRequest.primary_address,
      0
    );

    this.gameState.signupRequest.signature = await this.walletManager.createSignatureForProxyMessage(
      message,
      this.gameState.signingAccount.privkey
    );

    const playerCreatedListener = new PlayerCreatedListener();
    playerCreatedListener.guildId = this.gameState.signupRequest.guild_id;
    playerCreatedListener.playerAddress = this.gameState.signupRequest.primary_address;
    playerCreatedListener.authManager = this;
    playerCreatedListener.guildApi = this.guildApi;
    playerCreatedListener.gameState = this.gameState;

    this.grassManager.registerListener(playerCreatedListener);

    const response = await this.guildApi.signup(this.gameState.signupRequest);

    return response.success;
  }

  async login() {
    const timestamp = await this.guildApi.getTimestamp();

    const request = new LoginRequestDTO();
    request.address = this.gameState.signingAccount.address;
    request.pubkey = this.gameState.pubkey;
    request.guild_id = this.gameState.thisGuild.id;
    request.unix_timestamp = timestamp;

    const message = this.guildApi.buildLoginMessage(
      request.guild_id,
      request.address,
      timestamp
    );

    request.signature = await this.walletManager.createSignatureForProxyMessage(
      message,
      this.gameState.signingAccount.privkey
    );

    const response = await this.guildApi.login(request);

    console.log('Login response status:', response);

    return response.success;
  }

}