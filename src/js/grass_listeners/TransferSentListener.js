import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {toBase, legacyToBase} from "../util/Units";

export class TransferSentListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {string} fromAddress
   * @param {string} toAddress - expected primary_address counterparty
   * @param {string|bigint|number} alphaAmountUalpha - exact ualpha amount signed
   */
  constructor(gameState, fromAddress, toAddress, alphaAmountUalpha) {
    super('TRANSFER_SENT');
    this.gameState = gameState;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.alphaAmountP = toBase(alphaAmountUalpha) ?? 0n;
  }

  handler(messageData) {
    const subjectPrefix = `structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`;

    let eventAmount = toBase(messageData.amount_p);
    if (eventAmount === null) {
      eventAmount = legacyToBase(messageData.amount, 6);
    }
    if (eventAmount === null) {
      return;
    }
    if (eventAmount < 0n) {
      eventAmount = -eventAmount;
    }

    if (
      this.gameState.thisGuild.id
      && this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && messageData.category === 'sent'
      && (messageData.subject === subjectPrefix || messageData.subject.startsWith(`${subjectPrefix}.`))
      && messageData.counterparty === this.toAddress
      && eventAmount === this.alphaAmountP
    ) {
      this.shouldUnregister = () => true;

      MenuPage.router.goto('Account', 'transaction', {txId: messageData.id, comingFromPage: 1, hasBackToAccountBtn: true});
    }
  }
}
