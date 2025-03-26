import {AbstractGrassListener} from "./AbstractGrassListener";

export class PlayerCreatedListener extends AbstractGrassListener {

  constructor() {
    super('PLAYER_CREATED');
    this.guildId = null;
    this.playerAddress = null;
    this.authManager = null;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_consensus'
      && messageData.subject.startsWith(`structs.player.${this.guildId}`)
      && messageData.primary_address === this.playerAddress
    ) {
      console.log(messageData.id);

      this.authManager.login();

      this.shouldUnregister = () => true;
    }
  }
}