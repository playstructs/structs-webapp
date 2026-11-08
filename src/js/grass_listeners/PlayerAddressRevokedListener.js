import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class PlayerAddressRevokedListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {string} addressToWatch
   */
  constructor(
    gameState,
    guildAPI,
    addressToWatch,
    sessionAuthority
  ) {
    super('PLAYER_ADDRESS_REVOKED');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.addressToWatch = addressToWatch;
    this.sessionAuthority = sessionAuthority;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address'
      && messageData.subject === `structs.player.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`
      && messageData.status === 'revoked'
      && messageData.address === this.addressToWatch
    ) {
      if (this.gameState.signingAccount?.address === this.addressToWatch) {
        // GRASS invalidates the session view; only a fresh native read can
        // establish that this signing address no longer belongs to the player.
        this.sessionAuthority.request(messageData.block_height);
      } else {
        this.shouldUnregister = () => true;
        this.guildAPI.getPlayerAddressCount(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id, true).then(() => {
          MenuPage.router.goto('Account', 'devices');
        });
      }
    }
  }
}