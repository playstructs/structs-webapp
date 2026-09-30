import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {legacyToBase, toBase} from "../util/Units";

export class AlphaChangeListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   */
  constructor(gameState, guildAPI) {
    super('ALPHA_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this._reconcileTimer = null;
  }

  scheduleReconcile() {
    if (this._reconcileTimer) {
      clearTimeout(this._reconcileTimer);
    }
    this._reconcileTimer = setTimeout(() => {
      this._reconcileTimer = null;
      const playerId = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id;
      if (!playerId) {
        return;
      }
      this.guildAPI.getPlayer(playerId).then((player) => {
        this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setPlayer(player);
      }).catch((err) => {
        console.warn('AlphaChangeListener reconcile failed', err);
      });
    }, 1500);
  }

  handler(messageData) {
    const subjectPrefix = `structs.inventory.ualpha.${this.gameState.thisGuild.id}.${this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id}`;
    const player = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player;

    if (
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id
      && player
      && ['sent', 'received', 'refined'].includes(messageData.category)
      && (messageData.subject === subjectPrefix || messageData.subject.startsWith(`${subjectPrefix}.`))
      // Pin base denom: ignore ualpha.infused / ualpha.defusing state twins.
      && !String(messageData.subject || '').includes('.infused')
      && !String(messageData.subject || '').includes('.defusing')
    ) {
      let delta = toBase(messageData.amount_p);
      if (delta === null) {
        delta = legacyToBase(messageData.amount, 6) ?? 0n;
      }

      if (messageData.category === 'sent') {
        delta = -delta;
      }

      const current = player.alpha_p ?? 0n;
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setAlphaP(current + delta);
      this.scheduleReconcile();
    }
  }
}
