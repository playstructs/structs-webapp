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

      this.gameState.setThisPlayerId(messageData.id);

      this.authManager.login().then(async function () {
        const player = await this.guildAPI.getPlayer(messageData.id);
        this.gameState.setThisPlayer(player);

        const height = await this.guildAPI.getPlayerLastActionBlockHeight(messageData.id);
        this.gameState.setLastActionBlockHeight(height);

        await this.planetManager.findNewPlanet();
      }.bind(this));

      this.shouldUnregister = () => true;
    }
  }
}