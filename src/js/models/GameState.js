import {SignupRequestDTO} from "../dtos/SignupRequestDTO";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {EVENTS} from "../constants/Events";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {WalletManager} from "../managers/WalletManager";
import {GuildAPI} from "../api/GuildAPI";

export class GameState {

  constructor() {
    this.chargeCalculator = new ChargeCalculator();
    this.walletManager = new WalletManager();
    this.guildAPI = new GuildAPI();

    /* Multistep Request Data */
    this.signupRequest = new SignupRequestDTO();
    this.transferAmount = 0;

    /* Persistent Data */
    this.mnemonic = null;
    this.pubkey = null;
    this.thisPlayerId = null;
    this.lastSaveBlockHeight = 0;
    this.lastActionBlockHeight = 0;
    this.chargeLevel = 0;

    /* Must Be Re-instantiated On Load */
    this.wallet = null;
    this.signingAccount = null;
    this.signingClient = null;

    /* API Primed Data */
    this.thisGuild = null;
    this.thisPlayer = null;
    this.enemyPlayer = null;
    this.planet = null;
    this.planetShieldHealth = 100;

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
      lastSaveBlockHeight: this.lastSaveBlockHeight,
      lastActionBlockHeight: this.lastActionBlockHeight,
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

  /**
   * @param {number} height
   */
  setCurrentBlockHeight(height) {
    this.currentBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);

    console.log(`New Block`);
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
   * @param {Player} player
   */
  setThisPlayer(player) {
    this.thisPlayer = player;

    window.dispatchEvent(new CustomEvent(EVENTS.ALPHA_COUNT_CHANGED));
    window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED));
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
  }

  setPlanetShieldHealth(health) {
    this.planetShieldHealth = health;

    window.dispatchEvent(new CustomEvent(EVENTS.SHIELD_HEALTH_CHANGED));
  }

  /**
   * @param {string} type player or enemy
   * @return {string|null}
   */
  getPlayerIdByType(type) {
    if (type === PLAYER_TYPES.PLAYER) {
      if (this.thisPlayerId) {
        return this.thisPlayerId;
      }
      if (this.thisPlayer && this.thisPlayer.id) {
        return this.thisPlayer.id;
      }
    } else if (type === PLAYER_TYPES.ENEMY && this.enemyPlayer && this.enemyPlayer.id) {
      return this.enemyPlayer.id;
    }

    return null;
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

  /**
   * @param {number} amount
   */
  setTransferAmount(amount) {
    this.transferAmount = amount;
    this.save();
  }
}
