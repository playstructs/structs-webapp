import {SignupRequestDTO} from "../dtos/SignupRequestDTO";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {EVENTS} from "../constants/Events";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {WalletManager} from "../managers/WalletManager";
import {GuildAPI} from "../api/GuildAPI";
import {ShieldHealthCalculator} from "../util/ShieldHealthCalculator";
import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";

export class GameState {

  constructor() {
    this.chargeCalculator = new ChargeCalculator();
    this.walletManager = new WalletManager();
    this.guildAPI = new GuildAPI();
    this.shieldHealthCalculator = new ShieldHealthCalculator();

    /* Multistep Request Data */
    this.signupRequest = new SignupRequestDTO();
    this.transferAmount = 0;

    /* Persistent Data */
    this.mnemonic = null;
    this.pubkey = null;
    this.thisPlayerId = null;
    this.planetRaiderId = null;
    this.raidEnemyId = null;
    this.raidPlanetId = null;
    this.lastSaveBlockHeight = 0;
    this.lastActionBlockHeight = 0;
    this.planetRaiderLastActionBlockHeight = 0;
    this.raidEnemyLastActionBlockHeight = 0;
    this.chargeLevel = 0;

    /* Must Be Re-instantiated On Load */
    this.wallet = null;
    this.signingAccount = null;
    this.signingClient = null;

    /* API Primed Data */
    this.thisGuild = null;
    this.thisPlayer = null;
    this.planet = null;
    this.planetShieldHealth = 100;
    this.planetShieldInfo = new PlanetaryShieldInfoDTO();
    this.planetRaidStatus = null;

    this.planetRaider = null;

    this.raidEnemy = null;
    this.raidPlanet = null;
    this.raidPlanetShieldInfo = new PlanetaryShieldInfoDTO();
    this.raidStatus = null;

    /* GRASS Only Data */
    this.currentBlockHeight = 0;
  }

  save() {
    this.lastSaveBlockHeight = this.currentBlockHeight;

    if (!this.mnemonic) {
      console.error('Nullifying mnemonic!', this);
    }

    localStorage.setItem('gameState', JSON.stringify({
      mnemonic: this.mnemonic,
      pubkey: this.pubkey,
      thisPlayerId: this.thisPlayerId,
      planetRaiderId: this.planetRaiderId,
      raidEnemyId: this.raidEnemyId,
      raidPlanetId: this.raidPlanetId,
      lastSaveBlockHeight: this.lastSaveBlockHeight,
      lastActionBlockHeight: this.lastActionBlockHeight,
      planetRaiderLastActionBlockHeight: this.planetRaiderLastActionBlockHeight,
      raidEnemyLastActionBlockHeight: this.raidEnemyLastActionBlockHeight,
      chargeLevel: this.chargeLevel,
      transferAmount: this.transferAmount,
    }));
  }

  async load() {
    const gameState = localStorage.getItem('gameState');

    if (!gameState) {
      return;
    }

    Object.assign(this, JSON.parse(gameState));

    // Properties to re-instantiate
    this.wallet = await this.walletManager.createWallet(this.mnemonic);
    const accounts = await this.wallet.getAccountsWithPrivkeys();
    this.signingAccount = accounts[0];
  }

  /**
   * @param {string} id
   */
  setThisPlayerId(id) {
    this.thisPlayerId = id;

    this.save();
  }

  setPlanetRaiderId(id) {
    this.planetRaiderId = id;

    this.save();
  }

  setRaidEnemyId(id) {
    this.raidEnemyId = id;

    this.save();
  }

  setRaidPlanetId(id) {
    this.raidPlanetId = id;

    this.save();
  }

  /**
   * @param {number} height
   */
  setCurrentBlockHeight(height) {
    this.currentBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);
    this.setPlanetShieldHealth();

    console.log(`New Block ${height}`);
    window.dispatchEvent(new ChargeLevelChangedEvent(this.thisPlayerId, this.chargeLevel));
  }

  /**
   * @param {number} height
   */
  setLastActionBlockHeight(height) {
    this.lastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);
    this.save();

    window.dispatchEvent(new ChargeLevelChangedEvent(this.thisPlayerId, this.chargeLevel));
  }

  /**
   * @param {number} height
   */
  setPlanetRaiderLastActionBlockHeight(height) {
    this.planetRaiderLastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.planetRaiderLastActionBlockHeight);
    this.save();

    window.dispatchEvent(new ChargeLevelChangedEvent(this.planetRaiderId, this.chargeLevel));
  }

  setRaidEnemyLastActionBlockHeight(height) {
    this.raidEnemyLastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.raidEnemyLastActionBlockHeight);
    this.save();

    window.dispatchEvent(new ChargeLevelChangedEvent(this.raidEnemyId, this.chargeLevel));
  }

  /**
   * @param {Player} player
   */
  setThisPlayer(player) {
    this.thisPlayer = player;

    window.dispatchEvent(new CustomEvent(EVENTS.ALPHA_COUNT_CHANGED));
    window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED));
  }

  /**
   * @param {Player} player
   */
  setPlanetRaider(player) {
    this.planetRaider = player;
  }

  /**
   * @param {Player} player
   */
  setRaidEnemy(player) {
    this.raidEnemy = player;

    window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED_RAID_ENEMY));
  }

  /**
   * @param {number} alpha
   */
  setThisPlayerAlpha(alpha) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('alpha')) {
      this.thisPlayer.alpha = alpha;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ALPHA_COUNT_CHANGED));
    }
  }

  /**
   * @param {number} ore
   */
  setThisPlayerOre(ore) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('ore')) {
      this.thisPlayer.ore = ore;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED));
    }
  }

  /**
   * @param {number} ore
   */
  setRaidEnemyOre(ore) {
    if (this.raidEnemy && this.raidEnemy.hasOwnProperty('ore')) {
      this.raidEnemy.ore = ore;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED_RAID_ENEMY));
    }
  }

  /**
   * @param {number} capacity
   */
  setThisPlayerCapacity(capacity) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('capacity')) {
      this.thisPlayer.capacity = capacity;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('connection_capacity')) {
      this.thisPlayer.connection_capacity = connectionCapacity;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} load
   */
  setThisPlayerLoad(load) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('load')) {
      this.thisPlayer.load = load;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} structsLoad
   */
  setThisPlayerStructsLoad(structsLoad) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('structs_load')) {
      this.thisPlayer.structs_load = structsLoad;
      this.save();

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  setPlanet(planet) {
    this.planet = planet;

    window.dispatchEvent(new CustomEvent(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED));
  }

  setRaidPlanet(planet) {
    this.raidPlanet = planet;

    window.dispatchEvent(new CustomEvent(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED_RAID_PLANET));
  }

  setPlanetShieldHealth() {
    let health = 100;

    if (this.currentBlockHeight && this.planetShieldInfo.block_start_raid) {
      health = this.shieldHealthCalculator.calc(
        this.planetShieldInfo.planetary_shield,
        this.planetShieldInfo.block_start_raid,
        this.currentBlockHeight
      );
    }

    this.planetShieldHealth = health;

    window.dispatchEvent(new CustomEvent(EVENTS.SHIELD_HEALTH_CHANGED));
  }

  setRaidPlanetShieldHealth() {
    let health = 100;

    if (this.currentBlockHeight && this.raidPlanetShieldInfo.block_start_raid) {
      health = this.shieldHealthCalculator.calc(
        this.raidPlanetShieldInfo.planetary_shield,
        this.raidPlanetShieldInfo.block_start_raid,
        this.currentBlockHeight
      );
    }

    this.raidPlanetShieldHealth = health;

    window.dispatchEvent(new CustomEvent(EVENTS.SHIELD_HEALTH_CHANGED_RAID_PLANET));
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   */
  setPlanetShieldInfo(info) {
    this.planetShieldInfo = info;

    this.setPlanetShieldHealth();
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   */
  setRaidPlanetShieldInfo(info) {
    this.raidPlanetShieldInfo = info;

    this.setRaidPlanetShieldHealth();
  }

  /**
   * @param {string} status
   */
  setPlanetRaidStatus(status) {
    this.planetRaidStatus = status;

    window.dispatchEvent(new CustomEvent(EVENTS.PLANET_RAID_STATUS_CHANGED));
  }

  /**
   * @param {string} status
   */
  setRaidStatus(status) {
    this.raidStatus = status;

    window.dispatchEvent(new CustomEvent(EVENTS.RAID_STATUS_CHANGED));
  }

  /**
   * @param {string} type player or enemy
   * @return {string|null}
   */
  getPlayerIdByType(type) {
    let id = null;

    switch (type) {
      case PLAYER_TYPES.PLAYER:
        id = (this.thisPlayer && this.thisPlayer.id)
          ? this.thisPlayer.id
          : this.thisPlayerId;
        break;
      case PLAYER_TYPES.PLANET_RAIDER:
        id = (this.planetRaider && this.planetRaider.id) || id;
        break;
      case PLAYER_TYPES.RAID_ENEMY:
        id = (this.raidEnemy && this.raidEnemy.id) || id;
        break;
    }

    return id;
  }

  /**
   * @return {string}
   */
  getPlayerTag() {
    return this.thisPlayer && this.thisPlayer.tag.length > 0
      ? `[${this.thisPlayer.tag}]`
      : '';
  }

  /**
   * @return {string}
   */
  getPlayerUsername() {
    return this.thisPlayer && this.thisPlayer.username.length > 0
      ? `${this.thisPlayer.username}`
      : 'Name Redacted';
  }

  getRaidEnemyUsername() {
    return this.raidEnemy && this.raidEnemy.username.length > 0
      ? `${this.raidEnemy.username}`
      : `PID# ${this.raidEnemyId}`;
  }

  getPlanetRaiderUsername() {
    return this.planetRaider && this.planetRaider.username.length > 0
      ? `${this.planetRaider.username}`
      : `PID# ${this.planetRaiderId}`;
  }

  /**
   * @param {number} amount
   */
  setTransferAmount(amount) {
    this.transferAmount = amount;
    this.save();
  }
}
