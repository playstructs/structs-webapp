import * as natsCore from "@nats-io/nats-core";
import {GrassError} from "../errors/GrassError";

export class GrassManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.listeners = new Map();
  }

  /**
   * @param {MsgImpl} message
   * @return {object}
   */
  getMessageData(message) {
    return message.json();
  }

  /**
   * @param {object} messageData
   * @return {boolean}
   */
  shouldIgnoreMessage(messageData) {
    return !messageData.hasOwnProperty('subject')
      || !messageData.hasOwnProperty('category');
  }

  /**
   * @param {AbstractGrassListener} listener
   */
  registerListener(listener) {
    this.listeners.set(listener.name, listener.handler.bind(listener));
  }

  /**
   * @param {string} name
   */
  unregisterListener(name) {
    this.listeners.delete(name);
  }

  init() {
    if (this.gameState.thisGuild === null) {
      throw new GrassError("Init guild info before initializing GRASS. Guild info is needed for GRASS event filtering.");
    }

    natsCore.wsconnect({
      servers: "ws://localhost:1443"
    }).then((nc) => {
      const subscription = nc.subscribe(`structs.>`);
      (async function () {
        for await (const message of subscription) {

          const messageData = this.getMessageData(message);

          if (this.shouldIgnoreMessage(messageData)) {
            continue;
          }

          this.listeners.forEach((listener) => {
            listener(messageData);
          });

        }
        throw new GrassError("GRASS subscription closed unexpectedly.");
      }.bind(this))();
    });
  }
}