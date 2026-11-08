import {GrassManager as Client} from '../../src/js/framework/GrassManager.js';

export class GrassManager extends Client {
  constructor(url, subject, state, level) {
    super(`ws://${location.host}/fixture/nats`, subject, state, level);
  }
}
