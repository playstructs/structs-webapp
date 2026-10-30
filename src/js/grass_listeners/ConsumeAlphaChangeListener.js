import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

export class ConsumeAlphaChangeListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} structId
   */
  constructor(gameState, structId) {
    super(`CONSUME_ALPHA_CHANGE_${structId}`);
    this.gameState = gameState;
    this.structId = structId;
  }

  handler(messageData) {
    const subjectPrefix = `structs.inventory.ualpha.infused.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`;

    if (
      messageData.category === 'infused'
      && messageData.counterparty === this.structId
      && (messageData.subject === subjectPrefix || messageData.subject.startsWith(`${subjectPrefix}.`))
    ) {
      this.shouldUnregister = () => true;

      this.gameState.alphaRefresh.request(messageData.block_height_exact ?? messageData.block_height);
    }
  }
}
