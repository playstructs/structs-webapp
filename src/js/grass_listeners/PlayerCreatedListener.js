import {AbstractGrassListener} from "../framework/AbstractGrassListener";

export class PlayerCreatedListener extends AbstractGrassListener {

  constructor() {
    super('PLAYER_CREATED');
    this.guildId = null;
    this.playerAddress = null;
    this.authManager = null;
    this.guildAPI = null;
    this.gameState = null;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_consensus'
      && messageData.subject.startsWith(`structs.player.${this.guildId}`)
      && messageData.primary_address === this.playerAddress
    ) {
      console.log(messageData.id);

      const playerId = messageData.id;

      this.authManager.login();

      this.guildAPI.getPlayer(playerId).then(function (player) {
        this.gameState.thisPlayer = player;
      }.bind(this));

      this.guildAPI.getPlayerLastActionBlockHeight(playerId).then(function (height) {
        this.gameState.lastActionBlockHeight = height;
      }.bind(this));

      this.shouldUnregister = () => true;
    }
  }
}