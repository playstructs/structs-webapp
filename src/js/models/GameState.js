import {SignupRequestDTO} from "../dtos/SignupRequestDTO";

export class GameState {

  constructor() {
    this.signupRequest = new SignupRequestDTO();
    this.thisGuild = null;
  }
}