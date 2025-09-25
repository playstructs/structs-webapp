import {MenuPage} from "../../framework/MenuPage";
import {AbstractViewModel} from "../../framework/AbstractViewModel";
import {NumberFormatter} from "../../util/NumberFormatter";
import {RAID_STATUS} from "../../constants/RaidStatus";
import {RaidStatusListener} from "../../grass_listeners/RaidStatusListener";
import {MAP_CONTAINER_IDS} from "../../constants/MapConstants";
import {PlanetRaidFactory} from "../../factories/PlanetRaidFactory";
import {GenericResourceComponent} from "../components/GenericResourceComponent";

export class PreviewViewModel extends AbstractViewModel {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {FleetManager} fleetManager
   * @param {GrassManager} grassManager
   * @param {RaidManager} raidManager
   * @param {MapManager} mapManager
   * @param {string} planet_id
   * @param {number} planet_undiscovered_ore
   * @param {string} defender_id
   * @param {number} defender_ore
   * @param {string|null} attacker_id
   */
  constructor(
    gameState,
    guildAPI,
    fleetManager,
    grassManager,
    raidManager,
    mapManager,
    planet_id,
    planet_undiscovered_ore,
    defender_id,
    defender_ore,
    attacker_id = null
  ) {
    super();
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.fleetManager = fleetManager;
    this.grassManager = grassManager;
    this.raidManager = raidManager;
    this.mapManager = mapManager;
    this.planet_id = planet_id;
    this.planet_undiscovered_ore = planet_undiscovered_ore;
    this.defender_id = defender_id;
    this.defender_ore = defender_ore;
    this.attacker_id = attacker_id;
    this.numberFormatter = new NumberFormatter();
    this.planetRaidFactory = new PlanetRaidFactory();
    this.launchFleetBtnId = 'launch-fleet';
    this.undiscoveredOreId = 'preview-planet-undiscovered-ore';
    this.alphaOreId = 'preview-defender-ore-mined';
  }

  initPageCode() {
    if (this.attacker === null) {
      return;
    }

    document.getElementById(this.launchFleetBtnId).addEventListener('click', () => {
      const planetRaid = this.planetRaidFactory.make({
        fleet_id: this.gameState.thisPlayer.fleet_id,
        planet_id: this.planet_id,
        planet_owner: this.defender_id,
        status: RAID_STATUS.REQUESTED
      });

      this.gameState.setRaidPlanetRaidInfo(planetRaid);

      MenuPage.router.goto('Fleet', 'index');

      this.grassManager.registerListener(new RaidStatusListener(this.gameState, this.raidManager, this.mapManager));
      this.fleetManager.moveFleet(this.gameState.raidPlanetRaidInfo.planet_id).then();
    });
  }

  /**
   * @param {Player} player
   * @return {string}
   */
  renderUsernameHTML(player) {
    let tag = player.tag
      ? `<span class="sui-mod-secondary">[${player.tag}]</span>`
      : '';
    let username = player.username
      ? player.username
      : `PID #${player.id}`;


    return `<span>${tag} ${username}</span>`;
  }

  render() {
    Promise.all([
      this.guildAPI.getPlanet(this.planet_id),
      this.guildAPI.getPlayer(this.defender_id),
      (async () => (this.attacker_id === null)
            ? null
            : await this.guildAPI.getPlayer(this.attacker_id)
      )
    ]).then(
      ([
         planet,
         defender,
         attacker
      ]) => {

        this.mapManager.configurePreviewMap(planet, defender, attacker);
        this.mapManager.showMap(MAP_CONTAINER_IDS.PREVIEW);
        this.gameState.previewMap.render();

        const genericResourceComponent = new GenericResourceComponent(MenuPage.gameState);

        const headerResourcesHTML = `
          <div class="sui-page-header-resources">
            ${
              genericResourceComponent.renderHTML(
                this.undiscoveredOreId,
                'sui-icon-undiscovered-ore',
                'Undiscovered Ore',
                this.numberFormatter.format(this.planet_undiscovered_ore)
              )
            }
            ${
              genericResourceComponent.renderHTML(
                this.alphaOreId,
                'sui-icon-alpha-ore',
                'Ore Mined',
                this.numberFormatter.format(this.defender_ore)
              )
            }
          </div>
        `;

        MenuPage.enablePageTemplate(
          MenuPage.navItemFleetId,
          false,
          true,
          true,
            headerResourcesHTML,
            () => {
              (genericResourceComponent.getPageCode(this.undiscoveredOreId))();
              (genericResourceComponent.getPageCode(this.alphaOreId))();
            }
        );

        MenuPage.setPageTemplateHeaderBtn(this.renderUsernameHTML(defender), true, () => {
          MenuPage.router.back();
        });

        const launchFleetBtn = (this.attacker_id === null)
          ? `
            <div class="preview-map-btn-container">
              <a 
                id="${this.launchFleetBtnId}"
                class="sui-screen-btn sui-mod-primary"
                href="javascript: void(0)" 
              >Launch Fleet</a>
            </div>
          `
          : ``;

        MenuPage.setPageTemplateContent(`${launchFleetBtn}`);

        MenuPage.hideAndClearDialoguePanel();

        this.initPageCode();

        MenuPage.open();
      }
    );
  }
}
