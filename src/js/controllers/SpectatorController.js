import {AbstractController} from "../framework/AbstractController";
import {MenuPage} from "../framework/MenuPage";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {MAP_CONTAINER_IDS} from "../constants/MapConstants";
import {RAID_STATUS} from "../constants/RaidStatus";
import {EVENTS} from "../constants/Events";
import {ClearTileSelectionEvent} from "../events/ClearTileSelectionEvent";
import {KeyPlayerLastActionListener} from "../grass_listeners/KeyPlayerLastActionListener";
import {SpectatorHeightListener} from "../spectator/SpectatorHeightListener";
import {SpectatorMode} from "../spectator/SpectatorMode";
import {SpectatorStatusViewModel} from "../view_models/spectator/SpectatorStatusViewModel";
import {SectorBlitzFormat} from "../util/SectorBlitzFormat";
import {SectorBlitzHTML} from "../view_models/sector_blitz/SectorBlitzHTML";

/**
 * Spectating a Sector Blitz raid: the real raid map and HUD, with the attacker in the player's
 * slot and the defender in the raid enemy's, fed by the shared raid snapshot and the raided
 * planet's live messages. Nothing can be done on anyone's behalf.
 */
export class SpectatorController extends AbstractController {

  /**
   * @param {GameState} gameState
   * @param {SpectatorGuildAPI} guildAPI
   * @param {SpectatorGrassManager} grassManager
   * @param {GrassManager} blockGrassManager
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   * @param {DestroyedStructManager} destroyedStructManager
   */
  constructor(gameState, guildAPI, grassManager, blockGrassManager, raidManager, mapManager, destroyedStructManager) {
    super('Spectator', gameState);
    this.guildAPI = guildAPI;
    this.grassManager = grassManager;
    this.blockGrassManager = blockGrassManager;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.destroyedStructManager = destroyedStructManager;
    this.watching = false;

    window.addEventListener(EVENTS.SPECTATED_RAID_ENDED, event => this.raidEnded(event.detail));
  }

  loading() {
    new SpectatorStatusViewModel({
      title: 'Spectating',
      message: 'Connecting to the battle...',
      leaderboardUrl: SpectatorMode.leaderboardUrl(),
      loading: true,
    }).render();

    this.start().catch(error => {
      console.warn('[Spectator] the battle could not be loaded:', error);
      this.showUnavailable('This battle could not be loaded. It may have just ended. Try again from the Event Leaderboard.');
    });
  }

  /**
   * The menu a spectator opens from either portrait.
   */
  menu() {
    if (!this.watching) {
      return;
    }
    new SpectatorStatusViewModel({
      title: 'Spectating',
      leaderboardUrl: SpectatorMode.leaderboardUrl(),
      canWatch: true,
      detailHTML: this.matchupHTML(),
    }).render();
  }

  /**
   * @return {string}
   */
  matchupHTML() {
    const side = playerType => {
      const player = this.gameState.keyPlayers[playerType].player;
      return player && {
        player_id: player.id,
        username: player.username,
        tag: player.tag,
        pfp_client_render_attributes: player.pfp_client_render_attributes,
      };
    };
    return `
      <div class="spectator-matchup">
        ${SectorBlitzHTML.battleRowHTML(side(PLAYER_TYPES.RAID_ENEMY), side(PLAYER_TYPES.PLAYER))}
      </div>
    `;
  }

  /**
   * @param {string} message
   */
  showUnavailable(message) {
    this.watching = false;
    new SpectatorStatusViewModel({
      title: 'Spectating',
      message,
      leaderboardUrl: SpectatorMode.leaderboardUrl(),
    }).render();
  }

  async start() {
    const snapshot = await this.guildAPI.loadSnapshot(true);
    if (!snapshot.raid || !snapshot.attacker?.player || !snapshot.defender?.player) {
      this.showUnavailable(snapshot.phase === 'active'
        ? 'This battle is over. Pick another from Current Battles on the Event Leaderboard.'
        : 'Sector Blitz is not running right now, so there are no battles to watch.');
      return;
    }

    this.gameState.setStructTypes(await this.guildAPI.getStructTypes());
    // Charge is worked out from this as each player loads; the block clock takes over later.
    this.gameState.currentBlockHeight = Number(snapshot.height);

    // Every live message is checked for its block first (see SpectatorHeightListener).
    this.grassManager.registerListener(new SpectatorHeightListener(this.guildAPI));

    // The attacker takes the player's slot, as on a player's own raid map.
    const attackerId = snapshot.attacker.player.id;
    const attacker = this.gameState.keyPlayers[PLAYER_TYPES.PLAYER];
    attacker.setId(attackerId);
    const [player, lastAction, fleet, structs] = await Promise.all([
      this.guildAPI.getPlayer(attackerId),
      this.guildAPI.getPlayerLastActionBlockHeight(attackerId),
      this.guildAPI.getFleetByPlayerId(attackerId),
      this.guildAPI.getStructsByPlayerId(attackerId),
    ]);
    attacker.setPlayer(player);
    attacker.setLastActionBlockHeight(Number(snapshot.height), lastAction);
    attacker.setFleet(fleet);
    attacker.setStructs(structs);
    this.grassManager.registerListener(new KeyPlayerLastActionListener(this.gameState, PLAYER_TYPES.PLAYER));

    // The defender takes the raid enemy's slot; RaidManager loads it and registers its listeners.
    this.gameState.setRaidPlanetRaidInfo(await this.guildAPI.getActivePlanetRaidByPlanetId(this.guildAPI.planetId));
    await this.raidManager.initRaidEnemy();

    this.destroyedStructManager.init();
    this.gameState.setCurrentBlockHeight(Number(snapshot.height));

    this.mapManager.configureRaidMap();
    this.gameState.raidMap.render();
    this.gameState.setActiveMapContainerId(MAP_CONTAINER_IDS.RAID);
    this.mapManager.showMap(MAP_CONTAINER_IDS.RAID);
    window.dispatchEvent(new ClearTileSelectionEvent());

    // Only this planet's messages and the two players' charge and ore, not the whole chain.
    this.grassManager.subjects = [
      `structs.planet.${this.guildAPI.planetId}.>`,
      `structs.grid.player.${attackerId}.>`,
      `structs.grid.player.${snapshot.defender.player.id}.>`,
    ];
    this.grassManager.init();
    this.blockGrassManager.init();

    this.watching = true;
    MenuPage.close();
  }

  /**
   * @param {{status: string, seized_ore?: string}} detail the final raid_status message's detail
   */
  raidEnded(detail) {
    const defender = SectorBlitzFormat.escape(this.gameState.keyPlayers[PLAYER_TYPES.RAID_ENEMY].player?.username || 'The defender');
    const attacker = SectorBlitzFormat.escape(this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].player?.username || 'The attacker');
    const messages = {
      [RAID_STATUS.RAID_SUCCESSFUL]: `${attacker} won the raid.`,
      [RAID_STATUS.ATTACKER_DEFEATED]: `${defender} defended the planet.`,
      [RAID_STATUS.ATTACKER_RETREATED]: `${attacker} retreated. ${defender} keeps the planet.`,
      [RAID_STATUS.DEMILITARIZED]: `${defender}'s planet was demilitarized.`,
    };

    this.grassManager.stop();
    this.showUnavailable(`Battle over. ${messages[detail?.status] ?? ''}`.trim());
  }
}
