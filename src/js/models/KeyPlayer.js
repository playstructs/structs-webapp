import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {PlanetRaid} from "./PlanetRaid";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {SaveGameStateEvent} from "../events/SaveGameStateEvent";
import {StructCountChangedEvent} from "../events/StructCountChangedEvent";
import {Player} from "./Player";
import {AlphaCountChangedEvent} from "../events/AlphaCountChangedEvent";
import {EnergyUsageChangedEvent} from "../events/EnergyUsageChangedEvent";
import {OreCountChangedEvent} from "../events/OreCountChangedEvent";
import {ShieldHealthCalculator} from "../util/ShieldHealthCalculator";
import {ShieldHealthChangedEvent} from "../events/ShieldHealthChangedEvent";
import {UndiscoveredOreCountChangedEvent} from "../events/UndiscoveredOreCountChangedEvent";
import {PlanetRaidStatusChangedEvent} from "../events/PlanetRaidStatusChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {Fleet} from "./Fleet";
import {TrackDestroyedStructsEvent} from "../events/TrackDestroyedStructsEvent";
import {TrackDestroyedStructEvent} from "../events/TrackDestroyedStructEvent";

export class KeyPlayer {

  /**
   * @param {string} playerType See PLAYER_TYPES
   * @param {boolean} planetUsedForMap Whether or not this key player's planet is used for a map
   * @param {string} planetMapType The map type of this planet if it's used for a map.
   * @param {string} foreignRaidInfoKeyPlayer The key player that contains the raid info
   */
  constructor(
    playerType,
    planetUsedForMap,
    planetMapType = '',
    foreignRaidInfoKeyPlayer = ''
  ) {

    this.chargeCalculator = new ChargeCalculator();
    this.shieldHealthCalculator = new ShieldHealthCalculator();

    /** @type {string} See PLAYER_TYPES */
    this.playerType = playerType;

    /** @type {string} */
    this.id = '';

    /** @type {Player} */
    this.player = null;

    /** @type {number} */
    this.lastActionBlockHeight = 0;

    /** @type {number} */
    this.chargeLevel = 0;

    /** @type {Planet} */
    this.planet = null;

    /** @type {number} */
    this.planetShieldHealth = 100;

    /** @type {PlanetaryShieldInfoDTO} */
    this.planetShieldInfo = new PlanetaryShieldInfoDTO();

    /** @type {PlanetRaid} */
    this.planetRaidInfo = new PlanetRaid();

    /** @type {boolean} Whether or not this key player's planet is used for a map */
    this.planetUsedForMap = planetUsedForMap;

    /** @type {string} The map type of this planet if it's used for a map. */
    this.planetMapType = planetUsedForMap ? planetMapType : '';

    /** @type {Fleet} */
    this.fleet = null;

    /** @type {Object<string, Struct>} */
    this.structs = {};

    /** @type {string} foreignRaidInfoKeyPlayer */
    this.foreignRaidInfoKeyPlayer = foreignRaidInfoKeyPlayer;

  }

  setAlpha(alpha) {
    if (this.player && this.player.hasOwnProperty('alpha')) {
      this.player.alpha = alpha;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    if (this.player && this.player.hasOwnProperty('connection_capacity')) {
      this.player.connection_capacity = connectionCapacity;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {string} id
   */
  setId(id) {
    this.id = id;

    window.dispatchEvent(new SaveGameStateEvent());
  }

  /**
   * @param {number} currentBlockHeight
   * @param {number} height
   */
  setLastActionBlockHeight(currentBlockHeight, height) {
    this.lastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(currentBlockHeight, this.lastActionBlockHeight);

    window.dispatchEvent(new SaveGameStateEvent());
    window.dispatchEvent(new ChargeLevelChangedEvent(this.id, this.chargeLevel));
  }

  /**
   * @param {number} load
   */
  setLoad(load) {
    if (this.player && this.player.hasOwnProperty('load')) {
      this.player.load = load;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number} ore
   */
  setOre(ore) {
    if (this.player && this.player.hasOwnProperty('ore')) {
      this.player.ore = ore;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new OreCountChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Planet} planet
   */
  setPlanet(planet) {
    this.planet = planet;

    window.dispatchEvent(new UndiscoveredOreCountChangedEvent(this.playerType));
  }

  /**
   * @param {string} status
   * @param dispatchEvent
   */
  setPlanetRaidStatus(status, dispatchEvent = true) {
    this.planetRaidInfo.status = status;
    window.dispatchEvent(new SaveGameStateEvent());

    if (dispatchEvent) {
      window.dispatchEvent(new PlanetRaidStatusChangedEvent(this.playerType));
    }
  }

  /**
   * @param {number} currentBlockHeight
   */
  setPlanetShieldHealth(currentBlockHeight) {
    let health = 100;

    if (
      this.planetRaidInfo.isRaidActive()
      && currentBlockHeight
      && this.planetShieldInfo.block_start_raid
    ) {
      health = this.shieldHealthCalculator.calc(
        this.planetShieldInfo.planetary_shield,
        this.planetShieldInfo.block_start_raid,
        currentBlockHeight
      );
    }

    this.planetShieldHealth = health;

    window.dispatchEvent(new ShieldHealthChangedEvent(this.playerType));
  }

  /**
   * @param {PlanetaryShieldInfoDTO} info
   * @param {number} currentBlockHeight
   */
  setPlanetShieldInfo(info, currentBlockHeight) {
    this.planetShieldInfo = info;

    this.setPlanetShieldHealth(currentBlockHeight);
  }

  /**
   * @param {Player} player
   */
  setPlayer(player) {
    this.player = player;

    window.dispatchEvent(new AlphaCountChangedEvent(this.playerType));
    window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    window.dispatchEvent(new OreCountChangedEvent(this.playerType));
  }

  /**
   * @param {number} capacity
   */
  setPlayerCapacity(capacity) {
    if (this.player && this.player.hasOwnProperty('capacity')) {
      this.player.capacity = capacity;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Struct[]} structs
   */
  setStructs(structs) {
    this.structs = {};
    structs.forEach(struct => {
      this.structs[struct.id] = struct;
    });

    window.dispatchEvent(new StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new TrackDestroyedStructsEvent(this.playerType));
  }

  /**
   * @param {number} structsLoad
   */
  setStructsLoad(structsLoad) {
    if (this.player && this.player.hasOwnProperty('structs_load')) {
      this.player.structs_load = structsLoad;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(this.playerType));
    }
  }

  /**
   * @param {Struct} struct
   */
  setStruct(struct) {
    this.structs[struct.id] = struct;

    window.dispatchEvent(new StructCountChangedEvent(this.playerType));
    window.dispatchEvent(new TrackDestroyedStructEvent(this.playerType, struct.id));
  }

  /**
   * @param {number} currentBlockHeight
   * @return {number}
   */
  getCharge(currentBlockHeight) {
    return this.chargeCalculator.calcCharge(currentBlockHeight, this.lastActionBlockHeight);
  }

  getForeignRaidInfoSource() {
    return this.foreignRaidInfoKeyPlayer;
  }

  getPlanetId() {
    if (!this.planetUsedForMap) {
      return null;
    }

    if (this.planet) {
      return this.planet.id;
    } else if (this.isRaidDependent()) {
      return this.planetRaidInfo.planet_id;
    }

    return null;
  }

  /**
   * @return {string}
   */
  getPlanetShieldHealth() {
    return this.planetShieldHealth + "%";
  }

  /**
   * @return {string}
   */
  getTag() {
    return this.player && this.player.tag && this.player.tag.length > 0
      ? `[${this.player.tag}]`
      : '';
  }

  /**
   * @return {string}
   */
  getUsername() {
    return this.player && this.player.username && this.player.username.length > 0
      ? `${this.player.username}`
      : `PID# ${this.id}`;
  }

  /**
   * @return {boolean}
   */
  isRaidDependent() {
    return this.playerType !== PLAYER_TYPES.PLAYER;
  }

  /**
   * @return {boolean}
   */
  hasForeignRaidInfo() {
    return !!this.foreignRaidInfoKeyPlayer;
  }

  /**
   * @param {string} fleetId
   */
  isFleetOwner(fleetId) {
    return fleetId && this.fleet?.id === fleetId;
  }

}
