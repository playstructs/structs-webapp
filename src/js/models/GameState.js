import {SignupRequestDTO} from "../dtos/SignupRequestDTO";
import {ChargeCalculator} from "../util/ChargeCalculator";
import {EVENTS} from "../constants/Events";

export class GameState {

  constructor() {
    this.chargeCalculator = new ChargeCalculator();
    this.signupRequest = new SignupRequestDTO();

    this.server = null;
    this.fee = {
      amount: [
        {
          denom: "ualpha",
          amount: "0",
        },
      ],
      gas: "180000",
    };

    this.thisGuild = null;
    this.wallet = null;
    this.signingAccount = null;
    this.pubkey = null;
    this.thisPlayerId = null;
    this.thisPlayer = null;

    this.currentBlockHeight = 0;
    this.lastActionBlockHeight = 0;
    this.chargeLevel = 0;
  }

  /**
   * @param {number} height
   */
  setCurrentBlockHeight(height) {
    this.currentBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);

    console.log(`(Block Update) Charge Level: ${this.chargeLevel}`);
    window.dispatchEvent(new CustomEvent(EVENTS.CHARGE_LEVEL_CHANGED));
  }

  /**
   * @param {number} height
   */
  setLastActionBlockHeight(height) {
    this.lastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);

    console.log(`(Last Action Update) Charge Level: ${this.chargeLevel}`);
    window.dispatchEvent(new CustomEvent(EVENTS.CHARGE_LEVEL_CHANGED));
  }

  /**
   * @param {Player} player
   */
  setThisPlayer(player) {
    this.thisPlayer = player;

    window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED));
  }

  /**
   * @param {number} ore
   */
  setThisPlayerOre(ore) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('ore')) {
      this.thisPlayer.ore = ore;

      window.dispatchEvent(new CustomEvent(EVENTS.ORE_COUNT_CHANGED));
    }
  }

  /**
   * @param {number} capacity
   */
  setThisPlayerCapacity(capacity) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('capacity')) {
      this.thisPlayer.capacity = capacity;

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} connectionCapacity
   */
  setConnectionCapacity(connectionCapacity) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('connection_capacity')) {
      this.thisPlayer.connection_capacity = connectionCapacity;

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} load
   */
  setThisPlayerLoad(load) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('load')) {
      this.thisPlayer.load = load;

      window.dispatchEvent(new CustomEvent(EVENTS.ENERGY_USAGE_CHANGED));
    }
  }

  /**
   * @param {number} structsLoad
   */
  setThisPlayerStructsLoad(structsLoad) {
    if (this.thisPlayer && this.thisPlayer.hasOwnProperty('structs_load')) {
      this.thisPlayer.structs_load = structsLoad;
    }
  }
}
