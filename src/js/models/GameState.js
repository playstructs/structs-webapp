import {SignupRequestDTO} from "../dtos/SignupRequestDTO";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {EVENTS} from "../constants/Events";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {WalletManager} from "../managers/WalletManager";
import {GuildAPI} from "../api/GuildAPI";
import {ShieldHealthCalculator} from "../util/ShieldHealthCalculator";
import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {PlanetRaid} from "./PlanetRaid";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {StructTypeCollection} from "./StructTypeCollection";
import {Struct} from "./Struct";
import {Player} from "./Player";
import {Fleet} from "./Fleet"

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
    this.lastSaveBlockHeight = 0;
    this.lastActionBlockHeight = 0;
    this.planetRaiderLastActionBlockHeight = 0;
    this.raidEnemyLastActionBlockHeight = 0;
    this.chargeLevel = 0;
    this.planetRaiderChargeLevel = 0;
    this.raidEnemyChargeLevel = 0;
    this.activeMapContainerId = MAP_CONTAINER_IDS.ALPHA_BASE;

    /* Must Be Re-instantiated On Load */
    this.wallet = null;
    this.signingAccount = null;
    this.signingClient = null;

    /** @type {MapComponent} */
    this.alphaBaseMap = null;

    /** @type {MapComponent} */
    this.raidMap = null;

    /** @type {MapComponent} */
    this.previewMap = null;

    /* API Primed Data */

    /** @type {Guild} */
    this.thisGuild = null;

    /** @type {Player} */
    this.thisPlayer = null;

    /** @type {Planet} */
    this.planet = null;

    this.planetShieldHealth = 100;

    this.planetShieldInfo = new PlanetaryShieldInfoDTO();

    this.planetPlanetRaidInfo = new PlanetRaid();

    /** @type {Fleet} */
    this.thisPlayerFleet = null;

    /** @type {Struct[]} */
    this.thisPlayerStructs = [];

    /** @type {Player} */
    this.planetRaider = null;

    /** @type {Fleet} */
    this.planetRaiderFleet = null;

    /** @type {Struct[]} */
    this.planetRaiderStructs = [];

    this.raidPlanetRaidInfo = new PlanetRaid();

    /** @type {Player} */
    this.raidEnemy = null;

    /** @type {Planet} */
    this.raidPlanet = null;

    this.raidPlanetShieldHealth = 100;

    this.raidPlanetShieldInfo = new PlanetaryShieldInfoDTO();

    /** @type {Fleet} */
    this.raidEnemyFleet = null;

    /** @type {Struct[]} */
    this.raidEnemyStructs = [];

    this.structTypes = new StructTypeCollection();

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
      planetRaiderLastActionBlockHeight: this.planetRaiderLastActionBlockHeight,
      raidEnemyLastActionBlockHeight: this.raidEnemyLastActionBlockHeight,
      chargeLevel: this.chargeLevel,
      planetRaiderChargeLevel: this.planetRaiderChargeLevel,
      raidEnemyChargeLevel: this.raidEnemyChargeLevel,
      transferAmount: this.transferAmount,
      activeMapContainerId: this.activeMapContainerId
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
    this.setPlanetShieldHealth();

    if (this.planetPlanetRaidInfo.isRaidActive()) {
      this.planetRaiderChargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.planetRaiderLastActionBlockHeight);

      window.dispatchEvent(new ChargeLevelChangedEvent(this.getPlanetRaiderId(), this.planetRaiderChargeLevel));
    }

    if (this.raidPlanetRaidInfo.isRaidActive()) {
      this.raidEnemyChargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.raidEnemyLastActionBlockHeight);
      this.setRaidPlanetShieldHealth();

      window.dispatchEvent(new ChargeLevelChangedEvent(this.getRaidEnemyId(), this.raidEnemyChargeLevel));
    }

    this.save();

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
    this.planetRaiderChargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.planetRaiderLastActionBlockHeight);
    this.save();

    window.dispatchEvent(new ChargeLevelChangedEvent(this.getPlanetRaiderId(), this.planetRaiderChargeLevel));
  }

  setRaidEnemyLastActionBlockHeight(height) {
    this.raidEnemyLastActionBlockHeight = height;
    this.raidEnemyChargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.raidEnemyLastActionBlockHeight);
    this.save();

    window.dispatchEvent(new ChargeLevelChangedEvent(this.getRaidEnemyId(), this.raidEnemyChargeLevel));
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

    if (
      this.planetPlanetRaidInfo.isRaidActive()
      && this.currentBlockHeight
      && this.planetShieldInfo.block_start_raid
    ) {
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
   * @param {PlanetRaid} info
   * @param dispatchEvent
   */
  setPlanetPlanetRaidInfo(info, dispatchEvent = true) {
    this.planetPlanetRaidInfo = info;
    this.save();

    if (dispatchEvent) {
      window.dispatchEvent(new CustomEvent(EVENTS.PLANET_RAID_STATUS_CHANGED));
    }
  }

  /**
   * @param {PlanetRaid} info
   * @param dispatchEvent
   */
  setRaidPlanetRaidInfo(info, dispatchEvent = true) {
    this.raidPlanetRaidInfo = info;
    this.save();

    if (dispatchEvent) {
      window.dispatchEvent(new CustomEvent(EVENTS.RAID_STATUS_CHANGED));
    }
  }

  /**
   * @param {string} status
   * @param dispatchEvent
   */
  setPlanetPlanetRaidStatus(status, dispatchEvent = true) {
    this.planetPlanetRaidInfo.status = status;
    this.save();

    if (dispatchEvent) {
      window.dispatchEvent(new CustomEvent(EVENTS.PLANET_RAID_STATUS_CHANGED));
    }
  }

  /**
   * @param {string} status
   * @param dispatchEvent
   */
  setRaidPlanetRaidStatus(status, dispatchEvent = true) {
    this.raidPlanetRaidInfo.status = status;
    this.save();

    if (dispatchEvent) {
      window.dispatchEvent(new CustomEvent(EVENTS.RAID_STATUS_CHANGED));
    }
  }

  /**
   * @param {number} amount
   */
  setTransferAmount(amount) {
    this.transferAmount = amount;
    this.save();
  }

  /**
   * @param {string} id
   */
  setActiveMapContainerId(id) {
    this.activeMapContainerId = id;
    this.save();
  }

  /**
   * @param {array} types
   */
  setStructTypes(types) {
    this.structTypes.setStructTypes(types);
  }

  /**
   * @param {Fleet} fleet
   */
  setThisPlayerFleet(fleet) {
    this.thisPlayerFleet = fleet;
  }

  /**
   * @param {Fleet} fleet
   */
  setPlanetRaiderFleet(fleet) {
    this.planetRaiderFleet = fleet;
  }

  /**
   * @param {Fleet} fleet
   */
  setRaidEnemyFleet(fleet) {
    this.raidEnemyFleet = fleet;
  }

  /**
   * @param {Struct[]} structs
   */
  setThisPlayerStructs(structs) {
    this.thisPlayerStructs = structs;
  }

  /**
   * @param {Struct[]} structs
   */
  setPlanetRaiderStructs(structs) {
    this.planetRaiderStructs = structs;
  }

  /**
   * @param {Struct[]} structs
   */
  setRaidEnemyStructs(structs) {
    this.raidEnemyStructs = structs;
  }

  clearPlanetRaidData() {
    this.planetPlanetRaidInfo = new PlanetRaid();
    this.planetRaider = null;
    this.planetRaiderLastActionBlockHeight = 0;
    this.setPlanetShieldHealth();

    this.save();
  }

  clearRaidData() {
    this.raidEnemy = null;
    this.raidEnemyLastActionBlockHeight = 0;
    this.raidPlanet = null;
    this.setRaidPlanetRaidInfo(new PlanetRaid());

    this.save();
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
   * @param {String} playerId
   * @return {string}
   */
  getPlayerTypeById(playerId) {
    if (this.thisPlayerId === playerId) {
      return PLAYER_TYPES.PLAYER;
    }

    if (this.planetRaider && this.planetRaider.id === playerId) {
      return PLAYER_TYPES.PLANET_RAIDER;
    }

    if (this.raidEnemy && this.raidEnemy.id === playerId) {
      return PLAYER_TYPES.RAID_ENEMY;
    }

    throw new Error(`Player with ID ${playerId} has no type`);
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
   * @return {null|string}
   */
  getPlanetRaiderId() {
    return this.planetPlanetRaidInfo.fleet_owner
  }

  /**
   * @return {null|string}
   */
  getRaidEnemyId() {
    return this.raidPlanetRaidInfo.planet_owner
  }

  getRaidEnemyUsername() {
    return this.raidEnemy && this.raidEnemy.username && this.raidEnemy.username.length > 0
      ? `${this.raidEnemy.username}`
      : `PID# ${this.getRaidEnemyId()}`;
  }

  /**
   * @param {string} type
   * @return {Fleet}
   */
  getFleetByPlayerType(type) {
    switch (type) {
      case PLAYER_TYPES.PLAYER:
        return this.thisPlayerFleet;
      case PLAYER_TYPES.PLANET_RAIDER:
        return this.planetRaiderFleet;
      case PLAYER_TYPES.RAID_ENEMY:
        return this.raidEnemyFleet;
      default:
        return null;
    }
  }
}
