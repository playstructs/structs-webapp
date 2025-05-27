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
import {AddPendingAddressRequestDTO} from "../dtos/AddPendingAddressRequestDTO";
import {PlayerAddressApprovedLoginListener} from "../grass_listeners/PlayerAddressApprovedLoginListener";
import {PlayerAddressPendingCreatedListener} from "../grass_listeners/PlayerAddressPendingCreatedListener";
import {PlayerAddressPendingFactory} from "../factories/PlayerAddressPendingFactory";
import {SetPendingAddressPermissionsRequestDTO} from "../dtos/SetPendingAddressPermissionsRequestDTO";
import {FEE} from "../constants/Fee";
import {PlayerAddressApprovedListener} from "../grass_listeners/PlayerAddressApprovedListener";

export class AuthManager {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {WalletManager} walletManager
   * @param {GrassManager} grassManager
   * @param {SigningClientManager} signingClientManager
   * @param {PlanetManager} planetManager
   * @param {PlayerAddressManager} playerAddressManager
   * @param {PlayerAddressPendingFactory} playerAddressPendingFactory
   */
  constructor(
    gameState,
    guildAPI,
    walletManager,
    grassManager,
    signingClientManager,
    planetManager,
    playerAddressManager,
    playerAddressPendingFactory
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.walletManager = walletManager;
    this.grassManager = grassManager;
    this.signingClientManager = signingClientManager;
    this.planetManager = planetManager;
    this.playerAddressManager = playerAddressManager;
    this.playerAddressPendingFactory = playerAddressPendingFactory;
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<void>}
   */
  async initWallet(mnemonic) {
    this.gameState.wallet = await this.walletManager.createWallet(mnemonic);
    const accounts = await this.gameState.wallet.getAccountsWithPrivkeys();
    this.gameState.signingAccount = accounts[0];
    this.gameState.pubkey = this.walletManager.bytesToHex(this.gameState.signingAccount.pubkey);
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<boolean>}
   */
  async signup(mnemonic) {
    await this.initWallet(mnemonic);

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

  /**
   * @param {string} playerId
   * @return {Promise<boolean>}
   */
  async login(playerId) {
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
      this.playerAddressManager.addPlayerAddressMeta();

      this.gameState.setThisPlayerId(playerId);

      const player = await this.guildAPI.getPlayer(playerId);
      this.gameState.setThisPlayer(player);

      const height = await this.guildAPI.getPlayerLastActionBlockHeight(playerId);
      this.gameState.setLastActionBlockHeight(height);

      if (this.gameState.thisPlayer.planet_id) {
        const planet = await this.guildAPI.getPlanet(this.gameState.thisPlayer.planet_id);
        this.gameState.setPlanet(planet);

        const shieldHealth = await this.guildAPI.getPlanetShieldHealth(this.gameState.thisPlayer.planet_id);
        this.gameState.setPlanetShieldHealth(shieldHealth);
      }
    }

    return response.success;
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<boolean>}
   */
  async loginWithMnemonic(mnemonic) {
    try {
      await this.initWallet(mnemonic);

      const playerId = await this.guildAPI.getPlayerIdByAddressAndGuild(
        this.gameState.signingAccount.address,
        this.gameState.thisGuild.id
      );

      return this.login(playerId);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  logout() {
    this.guildAPI.logout().then(() => {
      localStorage.clear();
      MenuPage.router.goto('Auth', 'index');
      MenuPage.open();
    });
  }

  /**
   * @param {ActivationCodeInfoDTO} activationCodeInfo
   * @return {Promise<boolean>}
   */
  async addNewDevice(activationCodeInfo) {
    this.gameState.mnemonic = this.walletManager.createMnemonic();

    await this.initWallet(this.gameState.mnemonic);

    const message = this.guildAPI.buildAddressRegisterMessage(
      activationCodeInfo.player_id,
      this.gameState.signingAccount.address
    );

    const signature = await this.walletManager.createSignatureForProxyMessage(
      message,
      this.gameState.signingAccount.privkey
    );

    const request = new AddPendingAddressRequestDTO();
    request.player_id = activationCodeInfo.player_id;
    request.guild_id = this.gameState.thisGuild.id;
    request.code = activationCodeInfo.code;
    request.address = this.gameState.signingAccount.address;
    request.signature = signature;
    request.pubkey = this.gameState.pubkey;
    request.user_agent = window.navigator.userAgent;

    const playerAddressApprovedLoginListener = new PlayerAddressApprovedLoginListener(
      this.gameState,
      activationCodeInfo
    );
    this.grassManager.registerListener(playerAddressApprovedLoginListener);

    const response = await this.guildAPI.addPendingAddress(request);

    return response.success;
  }

  /**
   * @param {CreateActivationCodeRequestDTO} request
   * @return {Promise<string>}
   */
  async createActivationCode(request) {
    const response = await this.guildAPI.createActivationCode(request);

    let code = 'ERROR';

    if (response.success) {
      code = response.data.code;

      this.grassManager.registerListener(new PlayerAddressPendingCreatedListener(
        this.playerAddressPendingFactory,
        code
      ));
    }

    return code;
  }

  /**
   * @param {PlayerAddressPending} playerAddressPending
   * @return {Promise<boolean>}
   */
  async activateDevice(playerAddressPending) {
    const setPermissionsRequest = new SetPendingAddressPermissionsRequestDTO();
    setPermissionsRequest.code = playerAddressPending.code;
    setPermissionsRequest.address = playerAddressPending.address;
    setPermissionsRequest.permissions = playerAddressPending.permissions;

    const response = await this.guildAPI.setPendingAddressPermissions(setPermissionsRequest);

    if (!response.success) {
      return false;
    }

    const playerAddressApprovedListener = new PlayerAddressApprovedListener(
      this.gameState,
      this.guildAPI,
      playerAddressPending
    );
    this.grassManager.registerListener(playerAddressApprovedListener);

    const msg = this.signingClientManager.createMsgAddressRegister(
      this.gameState.signingAccount.address,
      this.gameState.thisPlayerId,
      playerAddressPending.address,
      playerAddressPending.pubkey,
      playerAddressPending.signature,
      playerAddressPending.permissions
    );

    try {
      await this.gameState.signingClient.signAndBroadcast(
        this.gameState.signingAccount.address,
        [msg],
        FEE
      );
    } catch (error) {
      console.log('Sign and Broadcast Error:', error);
    }

    await this.guildAPI.deleteActivationCode(playerAddressPending.code);

    return true;
  }

}