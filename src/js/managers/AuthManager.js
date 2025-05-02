import {PlayerCreatedListener} from "../grass_listeners/PlayerCreatedListener";
import {LoginRequestDTO} from "../dtos/LoginRequestDTO";
import {LastActionListener} from "../grass_listeners/LastActionListener";
import {PlayerOreListener} from "../grass_listeners/PlayerOreListener";
import {PlayerCapacityListener} from "../grass_listeners/PlayerCapacityListener";
import {PlayerLoadListener} from "../grass_listeners/PlayerLoadListener";
import {PlayerStructsLoadListener} from "../grass_listeners/PlayerStructsLoadListener";
import {ConnectionCapacityListener} from "../grass_listeners/ConnectionCapacityListener";
import {PlayerAlphaListener} from "../grass_listeners/PlayerAlphaListener";
import {MenuPage} from "../framework/MenuPage";
import {PlanetManager} from "./PlanetManager";
import {FirstPlanetListener} from "../grass_listeners/FirstPlanetListener";

export class AuthManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {WalletManager} walletManager
   * @param {GrassManager} grassManager
   * @param {SigningClientManager} signingClientManager
   * @param {PlanetManager} planetManager
   */
  constructor(
    gameState,
    guildAPI,
    walletManager,
    grassManager,
    signingClientManager,
    planetManager
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.walletManager = walletManager;
    this.grassManager = grassManager;
    this.signingClientManager = signingClientManager;
    this.planetManager = planetManager;
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

    const message = this.guildAPI.buildGuildMembershipJoinProxyMessage(
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
    playerCreatedListener.guildAPI = this.guildAPI;
    playerCreatedListener.gameState = this.gameState;
    playerCreatedListener.grassManager = this.grassManager;
    playerCreatedListener.planetManager = new PlanetManager(this.gameState, this.signingClientManager);

    const firstPlanetListener = new FirstPlanetListener(this.gameState, this.guildAPI);

    // Needs to be registered first because it listens for planet_id whose creation is trigger by playerCreatedListener.
    this.grassManager.registerListener(firstPlanetListener);

    this.grassManager.registerListener(playerCreatedListener);

    const response = await this.guildAPI.signup(this.gameState.signupRequest);

    return response.success;
  }

  async login() {
    const timestamp = await this.guildAPI.getTimestamp();

    const request = new LoginRequestDTO();
    request.address = this.gameState.signingAccount.address;
    request.pubkey = this.gameState.pubkey;
    request.guild_id = this.gameState.thisGuild.id;
    request.unix_timestamp = timestamp;

    const message = this.guildAPI.buildLoginMessage(
      request.guild_id,
      request.address,
      timestamp
    );

    request.signature = await this.walletManager.createSignatureForProxyMessage(
      message,
      this.gameState.signingAccount.privkey
    );

    const response = await this.guildAPI.login(request);

    console.log('Login response status:', response);

    if (response.success) {
      this.grassManager.registerListener(new LastActionListener(this.gameState));
      this.grassManager.registerListener(new PlayerAlphaListener(this.gameState));
      this.grassManager.registerListener(new PlayerOreListener(this.gameState));
      this.grassManager.registerListener(new PlayerLoadListener(this.gameState));
      this.grassManager.registerListener(new PlayerStructsLoadListener(this.gameState));
      this.grassManager.registerListener(new PlayerCapacityListener(this.gameState));
      this.grassManager.registerListener(new ConnectionCapacityListener(this.gameState));

      await this.signingClientManager.initSigningClient(this.gameState.wallet);
    }

    return response.success;
  }

  logout() {
    this.guildAPI.logout().then(() => {
      localStorage.clear();
      MenuPage.router.goto('Auth', 'index');
      MenuPage.open();
    });
  }

}