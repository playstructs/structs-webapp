import {SignupRequestDTO} from "../dtos/SignupRequestDTO";
import {ChargeCalculator} from "../util/ChargeCalculator";

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
  }

  /**
   * @param {number} height
   */
  setLastActionBlockHeight(height) {
    this.lastActionBlockHeight = height;
    this.chargeLevel = this.chargeCalculator.calc(this.currentBlockHeight, this.lastActionBlockHeight);
    console.log(`(Last Action Update) Charge Level: ${this.chargeLevel}`);
  }
}
