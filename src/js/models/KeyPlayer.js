import {PlanetaryShieldInfoDTO} from "../dtos/PlanetaryShieldInfoDTO";
import {PlanetRaid} from "./PlanetRaid";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {SaveGameStateEvent} from "../events/SaveGameStateEvent";
import {StructCountChangedEvent} from "../events/StructCountChangedEvent";
import {Player} from "./Player";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

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
