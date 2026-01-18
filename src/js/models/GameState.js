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
import {StructType} from "./StructType";
import {KeyPlayer} from "./KeyPlayer";
import {StructCountChangedEvent} from "../events/StructCountChangedEvent";

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
    this.lastSaveBlockHeight = 0;
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

    /**
     * @type {{player: KeyPlayer, raid_enemy: KeyPlayer, planet_raider: KeyPlayer}}
     */
    this.keyPlayers = {
      [PLAYER_TYPES.PLAYER]: new KeyPlayer(PLAYER_TYPES.PLAYER),
      [PLAYER_TYPES.RAID_ENEMY]: new KeyPlayer(PLAYER_TYPES.RAID_ENEMY),
      [PLAYER_TYPES.PLANET_RAIDER]: new KeyPlayer(PLAYER_TYPES.PLANET_RAIDER)
    };

    this.structTypes = new StructTypeCollection();

    /** @type {Object<string, Struct>} */
    this.previewDefenderStructs = {};

    /** @type {Object<string, Struct>} */
    this.previewAttackerStructs = {};

    /* GRASS Only Data */

    this.currentBlockHeight = 0;

    /* Temp Data */

    /**
     * Tracks pending builds before the struct ID is known.
     * Key: "{tileType}-{ambit}-{slot}-{playerId}"
     * Value: {structType: StructType, timestamp: number}
     * @type {Map<string, {structType: StructType, timestamp: number}>}
     */
    this.pendingBuilds = new Map();

    /* Allow saving from other classes without cyclical references. */
    window.addEventListener(EVENTS.SAVE_GAME_STATE, this.save.bind(this));
  }

  save() {
    this.lastSaveBlockHeight = this.currentBlockHeight;

    localStorage.setItem('gameState', JSON.stringify({
      mnemonic: this.mnemonic,
      pubkey: this.pubkey,
      thisPlayerId: this.keyPlayers[PLAYER_TYPES.PLAYER].id,
      lastSaveBlockHeight: this.lastSaveBlockHeight,
      lastActionBlockHeight: this.keyPlayers[PLAYER_TYPES.PLAYER].lastActionBlockHeight,
      planetRaiderLastActionBlockHeight: this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].lastActionBlockHeight,
      raidEnemyLastActionBlockHeight: this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].lastActionBlockHeight,
      chargeLevel: this.keyPlayers[PLAYER_TYPES.PLAYER].chargeLevel,
      planetRaiderChargeLevel: this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].chargeLevel,
      raidEnemyChargeLevel: this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].chargeLevel,
      transferAmount: this.transferAmount,
      activeMapContainerId: this.activeMapContainerId
    }));
  }

  async load() {
    const gameState = localStorage.getItem('gameState');

    if (!gameState) {
      return;
    }

    const gameStateParsed = JSON.parse(gameState);

    this.mnemonic = gameStateParsed.mnemonic;
    this.pubkey = gameStateParsed.pubkey;
    this.keyPlayers[PLAYER_TYPES.PLAYER].id = gameStateParsed.thisPlayerId;
    this.lastSaveBlockHeight = gameStateParsed.lastSaveBlockHeight;
    this.keyPlayers[PLAYER_TYPES.PLAYER].lastActionBlockHeight = gameStateParsed.lastActionBlockHeight;
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].lastActionBlockHeight = gameStateParsed.planetRaiderLastActionBlockHeight;
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].lastActionBlockHeight = gameStateParsed.raidEnemyLastActionBlockHeight;
    this.keyPlayers[PLAYER_TYPES.PLAYER].chargeLevel = gameStateParsed.chargeLevel;
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].chargeLevel = gameStateParsed.planetRaiderChargeLevel;
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].chargeLevel = gameStateParsed.raidEnemyChargeLevel;
    this.transferAmount = gameStateParsed.transferAmount;
    this.activeMapContainerId = gameStateParsed.activeMapContainerId;

    // Properties to re-instantiate
    this.wallet = await this.walletManager.createWallet(this.mnemonic);
    const accounts = await this.wallet.getAccountsWithPrivkeys();
    this.signingAccount = accounts[0];
  }

  /**
   * @param {number} height
   */
  setCurrentBlockHeight(height) {
    this.currentBlockHeight = height;
    this.keyPlayers[PLAYER_TYPES.PLAYER].chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.keyPlayers[PLAYER_TYPES.PLAYER].lastActionBlockHeight);
    this.setPlanetShieldHealth();

    if (this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo.isRaidActive()) {
      this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].lastActionBlockHeight);

      window.dispatchEvent(new ChargeLevelChangedEvent(this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id, this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].chargeLevel));
    }

    if (this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.isRaidActive()) {
      this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].lastActionBlockHeight);
      this.setRaidPlanetShieldHealth();

      window.dispatchEvent(new ChargeLevelChangedEvent(this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id, this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].chargeLevel));
    }

    this.save();

    console.log(`New Block ${height}`);
    window.dispatchEvent(new ChargeLevelChangedEvent(this.keyPlayers[PLAYER_TYPES.PLAYER].id, this.keyPlayers[PLAYER_TYPES.PLAYER].chargeLevel));
  }

  setPlanet(planet) {
    this.keyPlayers[PLAYER_TYPES.PLAYER].planet = planet;

    window.dispatchEvent(new CustomEvent(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED));
  }

  setRaidPlanet(planet) {
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planet = planet;

    window.dispatchEvent(new CustomEvent(EVENTS.UNDISCOVERED_ORE_COUNT_CHANGED_RAID_PLANET));
  }

  setPlanetShieldHealth() {
    let health = 100;

    if (
      this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo.isRaidActive()
      && this.currentBlockHeight
      && this.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldInfo.block_start_raid
    ) {
      health = this.shieldHealthCalculator.calc(
        this.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldInfo.planetary_shield,
        this.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldInfo.block_start_raid,
        this.currentBlockHeight
      );
    }

    this.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldHealth = health;

    window.dispatchEvent(new CustomEvent(EVENTS.SHIELD_HEALTH_CHANGED));
  }

  setRaidPlanetShieldHealth() {
    let health = 100;

    if (this.currentBlockHeight && this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.block_start_raid) {
      health = this.shieldHealthCalculator.calc(
        this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.planetary_shield,
        this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo.block_start_raid,
        this.currentBlockHeight
      );
    }

    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldHealth = health;

    window.dispatchEvent(new CustomEvent(EVENTS.SHIELD_HEALTH_CHANGED_RAID_PLANET));
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   */
  setPlanetShieldInfo(info) {
    this.keyPlayers[PLAYER_TYPES.PLAYER].planetShieldInfo = info;

    this.setPlanetShieldHealth();
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   */
  setRaidPlanetShieldInfo(info) {
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetShieldInfo = info;

    this.setRaidPlanetShieldHealth();
  }

  /**
   * @param {PlanetRaid} info
   * @param dispatchEvent
   */
  setPlanetPlanetRaidInfo(info, dispatchEvent = true) {
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo = info;
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id = info.fleet_owner;
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
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo = info;
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id = info.planet_owner;
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
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo.status = status;
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
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planetRaidInfo.status = status;
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
   * @param {Struct} struct
   */
  setStruct(struct) {
    const playerType = this.getPlayerTypeById(struct.owner);
    this.keyPlayers[playerType].setStruct(struct);
  }

  /**
   * Removes a struct by ID from all struct objects.
   *
   * @param {string} structId
   * @return {Struct|null} The removed struct, or null if not found
   */
  removeStruct(structId) {
    Object.keys(PLAYER_TYPES).forEach((playerType) => {
      if (this.keyPlayers[playerType].structs[structId]) {
        const removedStruct = this.keyPlayers[playerType].structs[structId];
        delete this.keyPlayers[playerType].structs[structId];

        window.dispatchEvent(new StructCountChangedEvent(playerType));

        return removedStruct;
      }
    });

    return null;
  }

  /**
   * Adds a pending build to track before the struct ID is known.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @param {StructType} structType
   */
  addPendingBuild(tileType, ambit, slot, playerId, structType) {
    const key = this.getPendingBuildKey(tileType, ambit, slot, playerId);
    this.pendingBuilds.set(key, {
      structType: structType,
      timestamp: Date.now()
    });
  }

  /**
   * Removes a pending build after the struct ID is known.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   */
  removePendingBuild(tileType, ambit, slot, playerId) {
    const key = this.getPendingBuildKey(tileType, ambit, slot, playerId);
    this.pendingBuilds.delete(key);
  }

  /**
   * @param {Struct[]} structs
   */
  setPreviewDefenderStructs(structs) {
    this.previewDefenderStructs = {};
    structs.forEach(struct => {
      this.previewDefenderStructs[struct.id] = struct;
    });
  }

  /**
   * @param {Struct[]} structs
   */
  setPreviewAttackerStructs(structs) {
    this.previewAttackerStructs = {};
    structs.forEach(struct => {
      this.previewAttackerStructs[struct.id] = struct;
    });
  }

  clearPlanetRaidData() {
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].planetRaidInfo = new PlanetRaid();
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].id = '';
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].player = null;
    this.keyPlayers[PLAYER_TYPES.PLANET_RAIDER].lastActionBlockHeight = 0;
    this.setPlanetShieldHealth();

    this.save();
  }

  clearRaidData() {
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].id = '';
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player = null;
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].lastActionBlockHeight = 0;
    this.keyPlayers[PLAYER_TYPES.RAID_ENEMY].planet = null;
    this.setRaidPlanetRaidInfo(new PlanetRaid());

    this.save();
  }

  /**
   * @param {string} type player or enemy
   * @return {string|null}
   */
  getPlayerIdByType(type) {
    return (this.keyPlayers[type] && this.keyPlayers[type].id)
      ? this.keyPlayers[type].id
      : null;
  }

  /**
   * @param {String} playerId
   * @return {string}
   */
  getPlayerTypeById(playerId) {
    Object.values(PLAYER_TYPES).forEach(type => {
      if (this.keyPlayers[type].id === playerId) {
        return type;
      }
    });

    throw new Error(`Player with ID ${playerId} has no type`);
  }

  /**
   * Generates a key for the pending builds map.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @return {string}
   */
  getPendingBuildKey(tileType, ambit, slot, playerId) {
    return `${tileType}-${ambit.toLowerCase()}-${slot}-${playerId}`;
  }

  /**
   * Gets a pending build by position.
   *
   * @param {string} tileType
   * @param {string} ambit
   * @param {number} slot
   * @param {string} playerId
   * @return {{structType: StructType, timestamp: number}|null}
   */
  getPendingBuild(tileType, ambit, slot, playerId) {
    const key = this.getPendingBuildKey(tileType, ambit, slot, playerId);
    return this.pendingBuilds.get(key) || null;
  }

  printMyPlayer() {
    console.log('Player ID: ' + this.keyPlayers[PLAYER_TYPES.PLAYER].id);
    console.log('Singing Account: ' + this.signingAccount.address);
    console.log('Primary Account: ' + this.keyPlayers[PLAYER_TYPES.PLAYER].player.primary_address);
  }
}
