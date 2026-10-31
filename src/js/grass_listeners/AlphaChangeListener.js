import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {CHAIN} from "../constants/ChainConstants";

export class AlphaChangeListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    super('ALPHA_CHANGE');
    this.gameState = gameState;
  }

  handler(messageData) {
    const owner = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
    if (!/^1-[1-9][0-9]*$/.test(owner) || typeof messageData.subject !== 'string'
        || (messageData.chain_id && messageData.chain_id !== CHAIN.ID)) return;
    const inventory = new RegExp(`^structs\\.inventory\\.ualpha(?:\\.(?:infused|defusing))?\\.[^.]+\\.${owner}(?:\\.|$)`).test(messageData.subject)
      && (messageData.owner_id === undefined || (messageData.owner_id === owner && messageData.owner_type === 'player'));
    const infusion = messageData.subject === `structs.grid.player.${owner}` && messageData.invalidates === 'infusion'
      && messageData.notification_owner_id === owner && messageData.notification_owner_type === 'player';
    if (inventory || infusion) this.gameState.alphaRefresh.request(messageData.block_height_exact ?? messageData.block_height);
  }
}
