import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {MenuPage} from "../framework/MenuPage";

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

      this.gameState.thisPlayerId = messageData.id;

      this.authManager.login().then(function () {
        this.guildAPI.getPlayer(messageData.id).then(function (player) {
          this.gameState.setThisPlayer(player);

          this.guildAPI.getPlayerLastActionBlockHeight(messageData.id).then(function (height) {
            this.gameState.setLastActionBlockHeight(height);
          }.bind(this));

        }.bind(this));

        MenuPage.router.goto('Auth', 'orientation1');
      }.bind(this));

      this.shouldUnregister = () => true;
    }
  }
}