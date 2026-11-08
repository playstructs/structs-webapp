import {SigningClientManager as Client} from '../../src/js/managers/SigningClientManager.js';

// Only the isolated-stack webpack config substitutes this constructor.
export class SigningClientManager extends Client {
  constructor(state) {
    super(state, false, `ws://${location.host}/fixture/rpc`);
  }
}
