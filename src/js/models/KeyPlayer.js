import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {PlanetRaid} from "./PlanetRaid";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {SaveGameStateEvent} from "../events/SaveGameStateEvent";
import {StructCountChangedEvent} from "../events/StructCountChangedEvent";
import {Player} from "./Player";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {AlphaCountChangedEvent} from "../events/AlphaCountChangedEvent";
import {EnergyUsageChangedEvent} from "../events/EnergyUsageChangedEvent";
import {OreCountChangedEvent} from "../events/OreCountChangedEvent";

export class KeyPlayer {

  /**
   * @param {string} playerType See PLAYER_TYPES
   */
  constructor(playerType) {

    this.chargeCalculator = new ChargeCalculator();

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

    /** @type {Fleet} */
    this.fleet = null;

    /** @type {Object<string, Struct>} */
    this.structs = {};

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
  }

  /**
   * @param {number} structsLoad
   */
  setStructsLoad(structsLoad) {
    if (this.player && this.player.hasOwnProperty('structs_load')) {
      this.player.structs_load = structsLoad;

      window.dispatchEvent(new SaveGameStateEvent());
      window.dispatchEvent(new EnergyUsageChangedEvent(PLAYER_TYPES.PLAYER));
    }
  }

  /**
   * @param {Struct} struct
   */
  setStruct(struct) {
    this.structs[struct.id] = struct;

    window.dispatchEvent(new StructCountChangedEvent(this.playerType));
  }

  /**
   * @param {number} currentBlockHeight
   * @return {number}
   */
  getCharge(currentBlockHeight) {
    return this.chargeCalculator.calcCharge(currentBlockHeight, this.lastActionBlockHeight);
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

}
