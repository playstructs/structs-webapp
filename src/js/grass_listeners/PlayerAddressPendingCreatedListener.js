import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

export class PlayerAddressPendingCreatedListener extends AbstractGrassListener {

  /**
   * @param {PlayerAddressPendingFactory} playerAddressPendingFactory
   * @param {string} activationCode
   */
  constructor(
    playerAddressPendingFactory,
    activationCode
  ) {
    super('PLAYER_ADDRESS_PENDING_CREATED');
    this.playerAddressPendingFactory = playerAddressPendingFactory;
    this.activationCode = activationCode;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_address_pending'
      && messageData.subject === `structs.address.register.${this.activationCode}`
      && !messageData.permissions
    ) {
      const playerAddressPending = this.playerAddressPendingFactory.make(messageData);

      this.shouldUnregister = () => true;

      MenuPage.router.goto('Account', 'approveNewDevice', playerAddressPending);
    }
  }
}