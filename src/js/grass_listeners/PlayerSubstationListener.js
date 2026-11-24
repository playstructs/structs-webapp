import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Follows the player to another substation, e.g. on joining a guild, as the
 * energy they are connected to changes with it.
 */
export class PlayerSubstationListener extends AbstractGrassListener {
  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('PLAYER_SUBSTATION');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
  }

  handler(messageData) {
    const keyPlayer = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];

    if (
      messageData.category !== 'player_consensus'
      || !keyPlayer.player
      || messageData.id !== keyPlayer.id
      || !messageData.hasOwnProperty('substation_id')
      || (messageData.substation_id || null) === (keyPlayer.player.substation_id || null)
    ) {
      return;
    }

    const substationId = messageData.substation_id || null;

    // Set right away so that the connection capacity listener follows the new substation.
    keyPlayer.player.substation_id = substationId;

    if (!substationId) {
      keyPlayer.setConnectionCapacity(0);
      return;
    }

    this.guildAPI.getPlayer(keyPlayer.id).then(player => {
      if (
        player.id === keyPlayer.player?.id
        && player.substation_id === substationId
        && keyPlayer.player.substation_id === substationId
      ) {
        keyPlayer.setConnectionCapacity(player.connection_capacity);
      }
    }).catch(error => {
      console.warn('[PlayerSubstationListener] connection capacity unavailable:', error);
    });
  }
}
