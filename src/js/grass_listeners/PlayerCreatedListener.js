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
    this.planetManager = null;
  }

  handler(messageData) {
    if (
      messageData.category === 'player_consensus'
      && messageData.subject.startsWith(`structs.player.${this.guildId}`)
      && messageData.primary_address === this.playerAddress
    ) {
      console.log(messageData.id);

      this.gameState.thisPlayerId = messageData.id;

      this.authManager.login().then(async function () {
        await this.planetManager.findNewPlanet();

        const height = await this.guildAPI.getPlayerLastActionBlockHeight(messageData.id);
        this.gameState.setLastActionBlockHeight(height);

        const player = await this.guildAPI.getPlayer(messageData.id);
        this.gameState.setThisPlayer(player);

        let maxLongPollTime = 60 * 1000;
        const longPollInterval = 5 * 1000;

        const longPollForPlanetId = async function() {
          const player = await this.guildAPI.getPlayer(messageData.id);
          this.gameState.setThisPlayer(player);

          if (player.planet_id) {
            const planet = await this.guildAPI.getPlanet(player.planet_id);
            this.gameState.setPlanet(planet);
            console.log(planet);

            MenuPage.router.goto('Auth', 'orientation1');

            return;
          }

          maxLongPollTime -= longPollInterval;
          if (maxLongPollTime <= 0) {
            MenuPage.setDialogueIndicatorContent(`<i class="sui-icon-md icon-alert sui-text-warning"></i>`, true);
            MenuPage.setDialogueScreenContent(`<strong>Error:</strong> Could not find planet. Contact support.`, true);
          } else {
            setTimeout(longPollForPlanetId, longPollInterval);
          }
        }.bind(this);

        setTimeout(longPollForPlanetId, longPollInterval);
      }.bind(this));

      this.shouldUnregister = () => true;
    }
  }
}