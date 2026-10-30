import {SessionAuthorityManager} from "./SessionAuthorityManager";
import {WorkRefreshManager} from "./WorkRefreshManager";
import {CHAIN} from "../constants/ChainConstants";
import {deviceChangeIntent} from "../util/DeviceChangeIntent";
import {readDeviceContext, readDeviceAuthority} from "./DeviceChangePreparation";
import {PERMISSIONS} from "../constants/Permissions";
import {deviceChangeCommit, waitForDeviceChange} from "../util/DeviceChangeCompletion";
import {DeviceRegistrationStore} from "./DeviceRegistrationStore";
import {registrationAssociation, registrationCommit, waitForRegistration} from "../util/RegistrationCompletion";
import {registrationIntent} from "../util/RegistrationIntent";
import {abortableDelay} from "../util/AbortableDelay";
import {pendingRegistrationProof} from "../util/RegistrationProof";
import {PlayerCreatedListener} from "../grass_listeners/PlayerCreatedListener";
import {LoginRequestDTO} from "../dtos/LoginRequestDTO";
import {KeyPlayerOreListener} from "../grass_listeners/KeyPlayerOreListener";
import {PlayerCapacityListener} from "../grass_listeners/PlayerCapacityListener";
import {PlayerLoadListener} from "../grass_listeners/PlayerLoadListener";
import {PlayerStructsLoadListener} from "../grass_listeners/PlayerStructsLoadListener";
import {ConnectionCapacityListener} from "../grass_listeners/ConnectionCapacityListener";
import {PlayerAlphaListener} from "../grass_listeners/PlayerAlphaListener";
import {MenuPage} from "../framework/MenuPage";
import {PlanetManager} from "./PlanetManager";
import {NewPlanetListener} from "../grass_listeners/NewPlanetListener";
import {AddPendingAddressRequestDTO} from "../dtos/AddPendingAddressRequestDTO";
import {PlayerAddressPendingFactory} from "../factories/PlayerAddressPendingFactory";
import {SetPendingAddressPermissionsRequestDTO} from "../dtos/SetPendingAddressPermissionsRequestDTO";
import {PlayerAddressRevokedListener} from "../grass_listeners/PlayerAddressRevokedListener";
import {AlphaChangeListener} from "../grass_listeners/AlphaChangeListener";
import {PlanetRaidStatusListener} from "../grass_listeners/PlanetRaidStatusListener";
import {StructListener} from "../grass_listeners/StructListener";
import {StructMineStatusListener} from "../grass_listeners/StructMineStatusListener";
import {StructRefineStatusListener} from "../grass_listeners/StructRefineStatusListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {KeyPlayerLastActionListener} from "../grass_listeners/KeyPlayerLastActionListener";
import {KeyPlayerShieldChangeStatusListener} from "../grass_listeners/KeyPlayerShieldChangeStatusListener";
import {LoginCompleteEvent} from "../events/LoginCompleteEvent";
import {PlanetRaidStatusChangedEvent} from "../events/PlanetRaidStatusChangedEvent";
import {TX_STATUS} from "../models/SigningTransaction";
import {TransactionJournal} from "./TransactionJournal";
import {AlphaRefreshManager} from "./AlphaRefreshManager";
import {startupReads} from "./StartupRecovery";

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
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   * @param {TaskManager} taskManager
   * @param {StructManager} structManager
   * @param {DestroyedStructManager} destroyedStructManager
   * @param {PermissionManager} permissionManager
   */
  constructor(
    gameState,
    guildAPI,
    walletManager,
    grassManager,
    signingClientManager,
    planetManager,
    playerAddressManager,
    playerAddressPendingFactory,
    raidManager,
    mapManager,
    taskManager,
    structManager,
    destroyedStructManager,
    permissionManager,
  ) {
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.walletManager = walletManager;
    this.grassManager = grassManager;
    this.signingClientManager = signingClientManager;
    this.planetManager = planetManager;
    this.playerAddressManager = playerAddressManager;
    this.playerAddressPendingFactory = playerAddressPendingFactory;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.taskManager = taskManager;
    this.structManager = structManager;
    this.destroyedStructManager = destroyedStructManager;
    this.permissionManager = permissionManager;
    this.gameState.alphaRefresh = new AlphaRefreshManager(gameState,guildAPI);
    this.sessionAuthority = new SessionAuthorityManager(gameState,signingClientManager,()=>this.logout());
    this.workRefresh = new WorkRefreshManager(gameState,guildAPI,taskManager);
    window.addEventListener('storage',event=>this.handleSessionClosed(event));
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<void>}
   */
  async initWallet(mnemonic, signal = undefined) {
    const epoch=this.walletEpoch=(this.walletEpoch ?? 0)+1;
    const wallet=await this.walletManager.createWallet(mnemonic);
    const [account]=await wallet.getAccountsWithPrivkeys();
    const assertCurrent=()=>{
      signal?.throwIfAborted();
      if (epoch !== this.walletEpoch || this.gameState.persistenceEnabled === false
          || this.gameState.isSessionCurrent?.() === false) throw new Error('Wallet initialization was superseded');
    };
    assertCurrent();
    if (this.gameState.signingAccount && this.gameState.signingAccount.address !== account.address) {
      this.signingClientManager.stopForLogout();
      await this.signingClientManager.queue.releaseAccount();
      assertCurrent();
    }
    this.gameState.wallet=wallet;
    this.gameState.signingAccount=account;
    this.gameState.pubkey=this.walletManager.bytesToHex(account.pubkey);
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
    playerCreatedListener.planetManager = this.planetManager;

    const newPlanetListener = new NewPlanetListener(
      this.gameState,
      this.guildAPI,
      this.mapManager
    );
    newPlanetListener.redirectControllerName = 'Auth';
    newPlanetListener.redirectPageName = 'orientation1';

    // Needs to be registered first because it listens for planet_id whose creation is trigger by playerCreatedListener.
    this.grassManager.registerListener(newPlanetListener);

    this.grassManager.registerListener(playerCreatedListener);

    const response = await this.guildAPI.signup(this.gameState.signupRequest);

    return response.success;
  }

  /**
   * @return {Promise<LoginRequestDTO>}
   */
  async buildLoginRequest() {
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

    return request;
  }

  /**
   * Restore an expired guild API session in place. The wallet that signs a
   * fresh login is already in memory, so a session that idles out does not need
   * a page reload to recover.
   *
   * Deliberately narrow: it renews the session and nothing else. Registering
   * listeners and priming game state belongs to {@link login}.
   *
   * @return {Promise<boolean>}
   */
  async reauthenticate() {
    if (!this.gameState.signingAccount || !this.gameState.thisGuild) {
      return false;
    }

    const response = await this.guildAPI.login(await this.buildLoginRequest());

    if (!response.success) {
      console.warn('[AuthManager] session re-authentication was rejected.');
    }

    return response.success;
  }

  /**
   * @param {string} playerId
   * @return {Promise<boolean>}
   */
  async login(playerId, signal = undefined, retry = operation=>operation()) {
    const address=this.gameState.signingAccount.address;
    const assertCurrent=()=>{
      signal?.throwIfAborted();
      if (this.gameState.signingAccount?.address !== address || this.gameState.isSessionCurrent?.() === false) throw new Error('Login device changed');
    };
    const recover=operation=>retry(async()=>{
      assertCurrent();
      const result=await operation();
      assertCurrent();
      return result;
    });
    assertCurrent();
    const response = await recover(async()=>this.guildAPI.login(await this.buildLoginRequest(),{signal}));
    assertCurrent();

    console.log('Login response status:', response);

    if (response.success) {
      this.gameState.alphaRefresh.stop();
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setId(playerId); // Must be set before registering many GRASS listeners

      this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.PLAYER));
      this.grassManager.registerListener(new PlayerAlphaListener(this.gameState));
      this.grassManager.registerListener(new KeyPlayerOreListener(this.gameState, this.guildAPI, PLAYER_TYPES.PLAYER));
      this.grassManager.registerListener(new KeyPlayerShieldChangeStatusListener(this.gameState, PLAYER_TYPES.PLAYER));
      this.grassManager.registerListener(new PlayerLoadListener(this.gameState));
      this.grassManager.registerListener(new PlayerStructsLoadListener(this.gameState));
      this.grassManager.registerListener(new PlayerCapacityListener(this.gameState));
      this.grassManager.registerListener(new ConnectionCapacityListener(this.gameState));
      this.grassManager.registerListener(new PlayerAddressRevokedListener(
        this.gameState,
        this.guildAPI,
        this.gameState.signingAccount.address,
        this.sessionAuthority
      ));
      this.grassManager.registerListener(new AlphaChangeListener(this.gameState));

      // Task related listeners
      this.grassManager.registerListener(new StructListener(
        this.gameState,
        this.guildAPI,
        this.structManager,
        PLAYER_TYPES.PLAYER
      ));
      this.grassManager.registerListener(new StructMineStatusListener(this.gameState));
      this.grassManager.registerListener(new StructRefineStatusListener(this.gameState));

      await recover(()=>this.signingClientManager.initSigningClient());
      assertCurrent();
      await recover(()=>this.playerAddressManager.addPlayerAddressMeta());
      assertCurrent();

      this.destroyedStructManager.init();

      const [
        player,
        height,
        structTypes,
        fleet,
        structs
      ] = await recover(()=>startupReads([
        ()=>this.guildAPI.getPlayer(playerId,{signal}),
        ()=>this.guildAPI.getPlayerLastActionBlockHeight(playerId),
        ()=>this.guildAPI.getStructTypes(),
        ()=>this.guildAPI.getFleetByPlayerId(playerId),
        ()=>this.guildAPI.getStructsByPlayerId(playerId)
      ]));

      assertCurrent();
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayer(player,this.gameState.currentBlockHeight);
      this.gameState.alphaRefresh.start();
      this.sessionAuthority?.start();
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, height);
      this.gameState.setStructTypes(structTypes);
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setFleet(fleet);
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setStructs(structs);

      this.grassManager.registerListener(new PlanetRaidStatusListener(
        this.gameState,
        this.guildAPI,
        this.raidManager,
        this.mapManager
      ));

      if (this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id) {

        const [
          planet,
          shieldInfo,
          planetPlanetRaidInfo,
          raidPlanetRaidInfo
        ] = await recover(()=>startupReads([
          ()=>this.guildAPI.getPlanet(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id),
          ()=>this.guildAPI.getPlanetaryShieldInfo(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id),
          ()=>this.guildAPI.getActivePlanetRaidByPlanetId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.planet_id),
          ()=>this.guildAPI.getActivePlanetRaidByFleetId(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player.fleet_id)
        ]));

        assertCurrent();
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanet(planet);
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlanetShieldInfo(shieldInfo, this.gameState.currentBlockHeight);
        this.gameState.setPlanetPlanetRaidInfo(planetPlanetRaidInfo);
        this.gameState.setRaidPlanetRaidInfo(raidPlanetRaidInfo);

        await recover(async()=>{
          const loaded=await startupReads([
            ()=>this.raidManager.initPlanetRaider(assertCurrent,false),
            ()=>this.raidManager.initRaidEnemy(assertCurrent,false),
          ]);
          if(loaded.includes(false)) throw new Error('Raid state is unavailable');
        });

        assertCurrent();
        this.mapManager.configureAlphaBaseMap();
        this.gameState.alphaBaseMap.render();

        this.mapManager.configureRaidMap();
        this.gameState.raidMap.render();

        // The raid status was announced before the raid enemy finished loading,
        // so anything that rendered then (e.g. the raid card) needs refreshing.
        window.dispatchEvent(new PlanetRaidStatusChangedEvent(PLAYER_TYPES.RAID_ENEMY));

        this.mapManager.showActiveMap();

        // Do this last so block height is available
        await this.taskManager.restoreTasksFromDB();
        assertCurrent();
        this.workRefresh?.start();

        window.dispatchEvent(new LoginCompleteEvent());

      // If the signup flow failed just before getting a planet, get a new planet for the user on login.
      } else if (!this.gameState.signupRequest.signature) {
        const newPlanetListener = new NewPlanetListener(
          this.gameState,
          this.guildAPI,
          this.mapManager
        );
        newPlanetListener.redirectCallback = () => {
          if (signal?.aborted || this.gameState.signingAccount?.address !== address) return;
          this.workRefresh?.start();
          window.dispatchEvent(new LoginCompleteEvent());
        };

        this.grassManager.registerListener(newPlanetListener);

        await this.planetManager.findNewPlanet();
      }
    }

    return response.success;
  }

  /**
   * @param {string} mnemonic
   * @return {Promise<boolean>}
   */
  async savedDevice(store) {
    let record=store.read();
    if (!record) {
      const mnemonic=this.walletManager.createMnemonic();
      const wallet=await this.walletManager.createWallet(mnemonic);
      const [account]=await wallet.getAccountsWithPrivkeys();
      record=store.write({mnemonic,address:account.address,pubkey:this.walletManager.bytesToHex(account.pubkey)});
    }
    const wallet=await this.walletManager.createWallet(record.mnemonic);
    const [account]=await wallet.getAccountsWithPrivkeys();
    if (account.address !== record.address || this.walletManager.bytesToHex(account.pubkey) !== record.pubkey) {
      throw new Error('Saved device key does not match its identity');
    }
    return {record,account};
  }

  async loginWithMnemonic(mnemonic, signal = MenuPage.router.navigationSignal) {
    await this.initWallet(mnemonic,signal);
    const primaryAddress=this.gameState.signingAccount.address, guildId=this.gameState.thisGuild.id;
    const playerId=await this.guildAPI.getPlayerIdByAddressAndGuild(primaryAddress,guildId);
    signal.throwIfAborted();
    if (!await this.reauthenticate()) return false;
    await this.signingClientManager.initSigningClient();
    signal.throwIfAborted();
    const store=new DeviceRegistrationStore('recovery',guildId,playerId,primaryAddress);
    const {record,id}=await store.exclusive(async()=>{
      const {record,account}=await this.savedDevice(store);
      const existing=this.signingClientManager.queue.findRegistration(playerId,record.address);
      if (existing && (![TX_STATUS.DROPPED,TX_STATUS.CANCELLED].includes(existing.status))) return {record,id:existing.id};
      // This method is invoked by an explicit recovery attempt. Only a known
      // terminal failure permits another consent; uncertainty reuses its queue ID.
      const proof=await this.guildAPI.getAddressRegistrationProof(playerId,record.address);
      const signature=await this.walletManager.createSignatureForProxyMessage(
        this.guildAPI.buildAddressRegisterMessage(playerId,record.address,proof),account.privkey);
      const permissions=String(this.permissionManager.getDefaultPlayerPermissions() | this.permissionManager.getManageDevicesPermissions());
      signal.throwIfAborted();
      if (this.gameState.signingAccount.address !== primaryAddress) throw new Error('Recovery signer changed');
      const saved=store.write({...record,proof,signature,permissions});
      const id=this.signingClientManager.queue.enqueueRegistration(registrationIntent({kind:'address_register',version:1,
        ownerId:playerId,address:record.address,pubkey:record.pubkey,signature,permissions,proof}));
      return {record:store.write({...saved,txId:id}),id};
    });
    const tx=await this.signingClientManager.queue.whenSettled(id,signal);
    signal.throwIfAborted();
    if (tx.status !== TX_STATUS.SUCCEEDED) return false;
    await waitForRegistration(this.guildAPI,{...registrationCommit(tx),guildId},signal);
    signal.throwIfAborted();
    if (this.gameState.signingAccount.address !== primaryAddress) throw new Error('Recovery signer changed');
    const success=await this.completeMnemonicLogin(playerId,record.mnemonic,signal);
    if (success) store.complete();
    return success;
  }

  /**
   * @param {string} playerId
   * @param {string} mnemonic
   * @return {Promise<boolean>}
   */
  async completeMnemonicLogin(playerId, mnemonic, signal = undefined) {
    signal?.throwIfAborted();
    await this.initWallet(mnemonic,signal);
    this.gameState.mnemonic = mnemonic;
    signal?.throwIfAborted();
    const success=await this.login(playerId,signal);
    if (success) this.gameState.save();
    return success;
  }

  /**
   * @param {string|null} addressToRevoke
   */
  deviceActionKey(address) {
    return `deviceChange:${CHAIN.ID}:${this.gameState.signingAccount.address}:${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}:${address}`;
  }

  async changeDevice(address, operation, permissions, expectedPermissions, signal) {
    const ownerId=this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id, signer=this.gameState.signingAccount.address;
    const key=this.deviceActionKey(address), queue=this.signingClientManager.queue;
    if (!globalThis.navigator?.locks?.request) throw new Error('Exclusive device action storage is unavailable');
    const id=await navigator.locks.request(key,{mode:'exclusive',ifAvailable:true},async lock=>{
      if (!lock) throw new Error('A device action is already being prepared');
      const pending=queue.findPendingDeviceChange(ownerId,address);
      const raw=localStorage.getItem(key), saved=raw ? JSON.parse(raw) : null;
      let existing=pending ?? (saved ? queue.getTransaction(saved.id) : null);
      if (saved && !existing) throw new Error('Saved device action requires recovery');
      if (existing?.isTerminal() && (existing.status !== TX_STATUS.SUCCEEDED
          || existing.intent?.operation !== operation || existing.intent?.permissions !== permissions)) {
        // This is a new explicit action after a known outcome, never an
        // automatic replacement for an uncertain send.
        localStorage.removeItem(key);
        existing=null;
      }
      if (existing) {
        const intent=deviceChangeIntent(existing.intent);
        if (existing.accountAddress !== signer || intent.ownerId !== ownerId || intent.address !== address
            || intent.operation !== operation || intent.permissions !== permissions) throw new Error('Resolve the existing device action before changing it');
      } else {
        const query=this.signingClientManager.chainQuery;
        if (!query || query.closed) throw new Error('Device chain connection is unavailable');
        const snapshot=await query.readSnapshot(rpc=>readDeviceContext(rpc,ownerId,address));
        signal.throwIfAborted();
        if (this.gameState.signingAccount.address !== signer || this.signingClientManager.chainQuery !== query) throw new Error('Device signer changed');
        const intent=deviceChangeIntent({kind:'device_change',version:1,ownerId,address,operation,permissions,expectedPermissions,context:snapshot.data});
        existing=queue.getTransaction(queue.enqueueDeviceChange(intent));
      }
      const record=JSON.stringify({id:existing.id});
      localStorage.setItem(key,record);
      if (localStorage.getItem(key) !== record) throw new Error('Device action could not be persisted');
      return existing.id;
    });
    const tx=await queue.whenSettled(id,signal);
    signal.throwIfAborted();
    const clear=()=>{
      const saved=localStorage.getItem(key);
      if (saved && JSON.parse(saved).id === id) localStorage.removeItem(key);
    };
    if (tx.status !== TX_STATUS.SUCCEEDED) { clear();return false; }
    const committed=deviceChangeCommit(tx);
    // A self-revoked key may no longer authenticate an indexed read. Confirmed
    // inclusion is sufficient to erase this browser's key/session on logout.
    if (operation !== 'revoke' || address !== signer) await waitForDeviceChange(this.guildAPI,committed,signal);
    signal.throwIfAborted();
    if (this.gameState.signingAccount.address !== signer) throw new Error('Device signer changed');
    clear();
    return true;
  }

  async setDevicePermissions(address, permissions, expectedPermissions, signal = MenuPage.router.navigationSignal) {
    return this.changeDevice(address,'permissions',permissions,expectedPermissions,signal);
  }

  async revokeAddress(addressToRevoke, signal = MenuPage.router.navigationSignal) {
    const signer=this.gameState.signingAccount.address;
    if (addressToRevoke === signer) {
      const query=this.signingClientManager.chainQuery;
      if (!query || query.closed) throw new Error('Device chain connection is unavailable');
      const {data:authority}=await query.readSnapshot(rpc=>readDeviceAuthority(rpc,signer));
      signal.throwIfAborted();
      if (this.gameState.signingAccount.address !== signer || this.signingClientManager.chainQuery !== query) throw new Error('Device signer changed');
      if (authority.playerId !== this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
          || (BigInt(authority.permissions) & BigInt(PERMISSIONS.DELETE)) === 0n) {
        // A key without revocation authority can still leave this browser.
        // Retain the public send journal; this does not revoke the on-chain key.
        await this.logout();
        return true;
      }
    }
    const success=await this.changeDevice(addressToRevoke,'revoke',null,null,signal);
    if (success && addressToRevoke === signer) await this.logout();
    return success;
  }

  handleSessionClosed(event) {
    if (event.key === TransactionJournal.SESSION_CLOSED_KEY && this.gameState.isSessionCurrent?.() === false) {
      return this.logout({fromOtherTab:true});
    }
  }

  logout({fromOtherTab = false} = {}) {
    if (this.logoutPromise) return this.logoutPromise;
    // A simulated session (the tutorial) must never clear the player's saved data.
    if (!this.gameState.persistenceEnabled) {
      return;
    }

    this.signingClientManager.stopForLogout();
    this.sessionAuthority?.stop();
    this.workRefresh?.stop();
    this.taskManager?.closeSession?.();
    this.gameState.alphaRefresh.stop();
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].clearFunds();
    this.walletEpoch=(this.walletEpoch ?? 0)+1;
    this.gameState.persistenceEnabled=false;
    this.gameState.mnemonic=null;
    this.gameState.wallet=null;
    this.gameState.signingAccount=null;
    this.gameState.pubkey=null;
    if (!fromOtherTab) {
      try { TransactionJournal.clearSession(); }
      catch (error) { console.warn('[Logout] private storage cleanup failed:',error); }
    }
    // Local logout must complete even if the server session endpoint is down.
    this.logoutPromise=Promise.resolve().then(()=>fromOtherTab ? undefined : this.guildAPI.logout({timeoutMs:5000})).catch(error=>{
      console.debug('[Logout] server session cleanup unavailable:',error);
    }).finally(() => {
      MenuPage.router.goto('Auth', 'index');
      MenuPage.open();
      window.location.reload();
    });
    return this.logoutPromise;
  }

  /**
   * @param {ActivationCodeInfoDTO} activationCodeInfo
   * @return {Promise<boolean>}
   */
  async addNewDevice(info, signal = MenuPage.router.navigationSignal) {
    const store=new DeviceRegistrationStore('activation',this.gameState.thisGuild.id,info.player_id,info.activation_id);
    return store.exclusive(async()=>{
      let {record,account}=await this.savedDevice(store);
      if (record.info && record.info.code !== info.code) throw new Error('Activation instance changed');
      await this.initWallet(record.mnemonic,signal);
      this.gameState.mnemonic=record.mnemonic;
      if (!record.proof) {
        const proof=await this.guildAPI.getAddressRegistrationProof(info.player_id,record.address);
        const signature=await this.walletManager.createSignatureForProxyMessage(
          this.guildAPI.buildAddressRegisterMessage(info.player_id,record.address,proof),account.privkey);
        signal.throwIfAborted();
        record=store.write({...record,proof,signature,info:{...info}});
      }
      store.markActive();
      if (record.accepted) return true;
      if (record.submitted) {
        // A lost POST response may be followed by a committed registration and
        // removal of the pending row. Verify that association before retrying.
        const response=await this.guildAPI.getRegistrationStatus(info.player_id,record.address,{signal});
        signal.throwIfAborted();
        if (registrationAssociation(response,{playerId:info.player_id,address:record.address,guildId:this.gameState.thisGuild.id,proof:record.proof})) {
          store.write({...record,accepted:true});
          return true;
        }
        // Native registration can lead the indexer. Never replace that consent
        // or turn lagging SQL into a rejected registration.
        if (response.data.chain.registered_player_id === info.player_id) return true;
      }
      const request=new AddPendingAddressRequestDTO();
      Object.assign(request,{player_id:info.player_id,guild_id:this.gameState.thisGuild.id,code:info.code,activation_id:info.activation_id,
        address:record.address,signature:record.signature,pubkey:record.pubkey,user_agent:window.navigator.userAgent});
      signal.throwIfAborted();
      record=store.write({...record,submitted:true});
      const response=await this.guildAPI.addPendingAddress(request,{signal});
      if (response.success) store.write({...record,accepted:true});
      return response.success;
    });
  }

  async restoreDeviceActivation() {
    const active=DeviceRegistrationStore.active(this.gameState.thisGuild.id);
    if (!active || !active.record.proof || !active.record.info) return false;
    const {record}=await this.savedDevice(active.store);
    this.gameState.mnemonic=record.mnemonic;
    await this.initWallet(record.mnemonic);
    MenuPage.router.goto('Auth','loginActivateDeviceWaitingForApproval',record.info);
    return true;
  }

  async waitForDeviceActivation(info, signal) {
    const store=new DeviceRegistrationStore('activation',this.gameState.thisGuild.id,info.player_id,info.activation_id);
    let record=store.read();
    if (!record?.proof || record.info?.code !== info.code) throw new Error('Saved activation consent is unavailable');
    if (!record.accepted) {
      // The previous POST response may have been lost. Reuse the exact saved
      // consent and key; the endpoint accepts an identical retry atomically.
      if (!await this.addNewDevice(info,signal)) throw new Error('Device activation consent is unavailable');
      record=store.read();
    }
    const {account}=await this.savedDevice(store);
    if (this.gameState.signingAccount.address !== account.address) throw new Error('Activation device changed');
    return waitForRegistration(this.guildAPI,{playerId:info.player_id,address:record.address,guildId:this.gameState.thisGuild.id,proof:record.proof},signal);
  }

  async completeDeviceActivation(info, signal) {
    await this.waitForDeviceActivation(info,signal);
    signal.throwIfAborted();
    const success=await this.login(info.player_id,signal);
    if (success) {
      this.gameState.save();
      new DeviceRegistrationStore('activation',this.gameState.thisGuild.id,info.player_id,info.activation_id).complete();
    }
    return success;
  }

  activationCodeStorageKey() {
    return `deviceActivationCode:${this.gameState.thisGuild.id}:${this.gameState.signingAccount.address}`;
  }

  savedActivationCode() {
    const raw=localStorage.getItem(this.activationCodeStorageKey());
    return raw ? JSON.parse(raw) : null;
  }

  async createActivationCode(request) {
    const response=await this.guildAPI.createActivationCode(request);
    if (!response.success) return null;
    const code=response.data;
    new DeviceRegistrationStore('activation',this.gameState.thisGuild.id,this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id,code.activation_id);
    localStorage.setItem(this.activationCodeStorageKey(),JSON.stringify(code));
    return code;
  }

  async waitForPendingDevice(activation, signal) {
    let delay=2000;
    while (!signal.aborted) {
      // Approval can already have committed while SQL removed its pending row.
      // This saved row is only a locator; activateDevice still checks the signed
      // journal or refetches current server consent before enqueuing anything.
      if (activation.pending && this.signingClientManager.queue.findRegistration(activation.pending.player_id,activation.pending.address)) {
        return activation.pending;
      }
      try {
        const row=await this.guildAPI.getPendingAddressByCode(activation.code,activation.activation_id,{signal});
        signal.throwIfAborted();
        if (row && row.activation_id === activation.activation_id && row.player_id === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id) {
          pendingRegistrationProof(row);
          return row;
        }
      } catch (error) {
        signal.throwIfAborted();
        console.debug('[DeviceActivation] pending device unavailable:',error);
      }
      await abortableDelay(delay,signal);delay=Math.min(delay*2,30000);
    }
    signal.throwIfAborted();
  }

  async activateDevice(chosen, signal = MenuPage.router.navigationSignal) {
    const playerId=this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id, signer=this.gameState.signingAccount.address;
    let tx=this.signingClientManager.queue.findRegistration(playerId,chosen.address);
    if (tx && tx.intent.permissions !== String(chosen.permissions)) throw new Error('Existing registration has different permissions');
    if (!tx) {
      const pending=await this.guildAPI.getPendingAddressByCode(chosen.code,chosen.activation_id,{signal});
      if (!pending || pending.address !== chosen.address || pending.pubkey !== chosen.pubkey || pending.signature !== chosen.signature) return false;
      const proof=pendingRegistrationProof(pending);
      const request=new SetPendingAddressPermissionsRequestDTO();
      Object.assign(request,{code:chosen.code,activation_id:chosen.activation_id,address:chosen.address,permissions:chosen.permissions});
      if (!(await this.guildAPI.setPendingAddressPermissions(request)).success) return false;
      signal.throwIfAborted();
      if (this.gameState.signingAccount.address !== signer) throw new Error('Approval signer changed');
      localStorage.setItem(this.activationCodeStorageKey(),JSON.stringify({code:chosen.code,activation_id:chosen.activation_id,pending:{...pending,permissions:chosen.permissions}}));
      const id=this.signingClientManager.queue.enqueueRegistration(registrationIntent({kind:'address_register',version:1,ownerId:playerId,
        address:chosen.address,pubkey:chosen.pubkey,signature:chosen.signature,permissions:String(chosen.permissions),proof}));
      tx=this.signingClientManager.queue.getTransaction(id);
    }
    const settled=await this.signingClientManager.queue.whenSettled(tx.id,signal);
    signal.throwIfAborted();
    if (settled.status !== TX_STATUS.SUCCEEDED) return false;
    await waitForRegistration(this.guildAPI,{...registrationCommit(settled),guildId:this.gameState.thisGuild.id},signal);
    signal.throwIfAborted();
    if (this.gameState.signingAccount.address !== signer) throw new Error('Approval signer changed');
    // Cleanup is idempotent and never turns a committed registration into failure.
    try { await this.guildAPI.deleteActivationCode(chosen.code,chosen.activation_id); }
    catch (error) { console.debug('[DeviceActivation] activation cleanup deferred:',error); }
    const saved=this.savedActivationCode();
    if (saved?.activation_id === chosen.activation_id) localStorage.removeItem(this.activationCodeStorageKey());
    this.guildAPI.getPlayerAddressCount(playerId,true).catch(()=>{});
    return true;
  }

}
