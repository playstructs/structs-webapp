import {SignupRequestDTO} from "../dtos/SignupRequestDTO";

export class GameState {

  constructor() {
    this.signupRequest = new SignupRequestDTO();

    this.thisGuild = null;
    this.wallet = null;
    this.signingAccount = null;
    this.pubkey = null;
    this.thisPlayer = null;

    this.currentBlockHeight = null;
    this.lastActionBlockHeight = null;
  }
}
