import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerCreatedListener extends AbstractGrassListener {

  constructor() {
    super('PLAYER_CREATED');
    this.guildId = null;
    this.playerAddress = null;
    this.authManager = null;
    this.guildAPI = null;
    this.gameState = null;
    this.planetManager = null;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_consensus'
      && messageData.subject.startsWith(`structs.player.${this.guildId}`)
      && messageData.primary_address === this.playerAddress
    ) {
      console.log(messageData.id);

      this.authManager.login(messageData.id).then(async function () {
        await this.planetManager.findNewPlanet();
      }.bind(this));

      this.shouldUnregister = () => true;
    }
  }
}