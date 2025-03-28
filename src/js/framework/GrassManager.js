import * as natsCore from "@nats-io/nats-core";
import {GrassError} from "./GrassError";

/**
 * Guild Rapid Alert System Stream
 */
export class GrassManager {

  /**
   * @param {string} grassServerUrl
   * @param {string} subject
   */
  constructor(grassServerUrl, subject) {
    this.grassServerUrl = grassServerUrl;
    this.subject = subject;
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
    this.listeners.set(listener.name, listener);
  }

  /**
   * @param {string} name
   */
  unregisterListener(name) {
    this.listeners.delete(name);
  }

  init() {
    natsCore.wsconnect({
      servers: this.grassServerUrl,
    }).then((nc) => {
      const subscription = nc.subscribe(this.subject);
      (async function () {

        for await (const message of subscription) {

          const messageData = this.getMessageData(message);

          if (this.shouldIgnoreMessage(messageData)) {
            continue;
          }

          this.listeners.forEach((listener) => {
            listener.handler(messageData);

            if (listener.shouldUnregister()) {
              this.unregisterListener(listener.name);
            }
          });

        }

        throw new GrassError("GRASS subscription closed unexpectedly.");

      }.bind(this))();
    });
  }
}