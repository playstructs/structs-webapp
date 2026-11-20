import {AbstractGrassListener} from "../framework/AbstractGrassListener";

/**
 * Registered before every other listener, so the spectator API knows a live message's block
 * before the struct listener refreshes structs from it.
 */
export class SpectatorHeightListener extends AbstractGrassListener {

  /**
   * @param {SpectatorGuildAPI} guildAPI
   */
  constructor(guildAPI) {
    super('SPECTATOR_HEIGHT');
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    this.guildAPI.observeHeight(messageData.block_height);
  }
}
