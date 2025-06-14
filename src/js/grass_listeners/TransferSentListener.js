import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class TransferSentListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {number} alphaAmount
   */
  constructor(gameState, fromAddress, toAddress, alphaAmount) {
    super('TRANSFER_SENT');
    this.gameState = gameState;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.alphaAmount = alphaAmount;
  }

  handler(messageData) {
    if (
      this.gameState.thisGuild.id
      && this.gameState.thisPlayerId
      && messageData.category === 'sent'
      && messageData.subject === `structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.thisPlayerId}.${this.fromAddress}`
      && messageData.address === this.fromAddress
      && messageData.counterparty === this.toAddress
      && Math.abs(messageData.amount) === this.alphaAmount
    ) {
      this.shouldUnregister = () => true;

      MenuPage.router.goto('Account', 'transaction', {txId: messageData.id, comingFromPage: 1, hasBackToAccountBtn: true});
    }
  }
}