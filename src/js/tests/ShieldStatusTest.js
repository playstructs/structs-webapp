import {DTest, DTestSuite} from "../framework/DTestFramework";
import {ShieldStatusComponent} from "../view_models/components/ShieldStatusComponent";
import {KeyPlayer} from "../models/KeyPlayer";
import {Fleet} from "../models/Fleet";
import {Struct} from "../models/Struct";
import {PlanetRaid} from "../models/PlanetRaid";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {RAID_STATUS} from "../constants/RaidStatus";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";
import {MAP_TYPES} from "../constants/MapConstants";

/**
 * Covers the shield status shown on the map HUD, which reads secure while the
 * command ship holds station over the planet, vulnerable once it leaves or is
 * destroyed, and breached when that happens with a raid underway.
 *
 * The status is derived from state the player never edits directly (the fleet,
 * the command struct and the raid), so each of those has to announce itself for
 * the HUD to keep up. The regression these tests exist for is the fleet: it was
 * assigned straight onto the key player, so leaving for a raid and coming home
 * both left the icon showing whatever it showed before.
 */
export class ShieldStatusTest extends DTestSuite {

  constructor() {
    super('ShieldStatusTest');
  }

  /**
   * The suites run under Node with only the sliver of the DOM they touch, so
   * the three elements the component writes to are stood up by hand.
   *
   * @param {string} elementId
   * @return {Object<string, object>}
   */
  static givenDocument(elementId) {
    const elements = {
      [elementId]: {dataset: {}},
      [`${elementId}-icon-wrapper`]: {innerHTML: ''},
      [`${elementId}-value`]: {
        innerText: '',
        classList: {add: () => {}, remove: () => {}}
      }
    };

    global.document = {
      getElementById: (id) => elements[id] ?? null
    };

    return elements;
  }

  /**
   * @param {string} playerType
   * @param {boolean} commandShipOnStation
   * @param {boolean} commandShipAlive
   * @param {string|null} raidStatus
   * @return {KeyPlayer}
   */
  static makePlanetOwner(
    playerType,
    commandShipOnStation,
    commandShipAlive,
    raidStatus = null
  ) {
    const keyPlayer = new KeyPlayer(
      playerType,
      true,
      playerType === PLAYER_TYPES.PLAYER ? MAP_TYPES.ALPHA_BASE : MAP_TYPES.RAID
    );

    keyPlayer.id = '1-1';
    keyPlayer.planetRaidInfo = new PlanetRaid();
    keyPlayer.planetRaidInfo.status = raidStatus;

    const commandStruct = new Struct();
    commandStruct.id = '5-1';
    commandStruct.status = commandShipAlive
      ? STRUCT_STATUS_FLAGS.BUILT
      : STRUCT_STATUS_FLAGS.BUILT | STRUCT_STATUS_FLAGS.DESTROYED;
    keyPlayer.structs = {'5-1': commandStruct};

    keyPlayer.fleet = ShieldStatusTest.makeFleet(commandShipOnStation);

    return keyPlayer;
  }

  /**
   * @param {boolean} onStation
   * @return {Fleet}
   */
  static makeFleet(onStation) {
    const fleet = new Fleet();
    fleet.id = '4-1';
    fleet.command_struct = '5-1';
    fleet.status = onStation ? 'onStation' : 'away';
    return fleet;
  }

  /**
   * Builds a component wired to a single planet owner and renders it once, the
   * way the HUD does when the page first loads.
   *
   * @param {KeyPlayer} planetOwner
   * @return {{elements: Object<string, object>, component: ShieldStatusComponent}}
   */
  static givenRenderedComponent(planetOwner) {
    const elementId = `${planetOwner.playerType}-hud-shield-status`;
    const elements = ShieldStatusTest.givenDocument(elementId);

    const gameState = {keyPlayers: {[planetOwner.playerType]: planetOwner}};
    const component = new ShieldStatusComponent(gameState, planetOwner.playerType, elementId);
    component.initPageCode();

    return {elements: elements, component: component};
  }

  /**
   * @param {Object<string, object>} elements
   * @param {string} elementId
   * @return {string}
   */
  static shownStatus(elements, elementId) {
    return elements[elementId].dataset.suiCheatsheet;
  }

  // The six states the status is specified to show, read straight off a
  // rendered component.
  shownStatusFollowsTheCommandShipAndRaidTest = new DTest('shownStatusFollowsTheCommandShipAndRaidTest', function(params) {
    const planetOwner = ShieldStatusTest.makePlanetOwner(
      params.playerType,
      params.commandShipOnStation,
      params.commandShipAlive,
      params.raidStatus
    );
    const {elements} = ShieldStatusTest.givenRenderedComponent(planetOwner);

    this.assertEquals(
      ShieldStatusTest.shownStatus(elements, `${params.playerType}-hud-shield-status`),
      `shield-${params.expected}`
    );
  }, function() {
    return [
      // Alpha base: the command ship is home, so the shield holds either way.
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: null,
        expected: 'secure'
      },
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: RAID_STATUS.ONGOING,
        expected: 'secure'
      },
      // Alpha base: the command ship is away or dead, and nobody is raiding.
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: null,
        expected: 'vulnerable'
      },
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: null,
        expected: 'vulnerable'
      },
      // Alpha base: the command ship is away or dead with a raid underway.
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: RAID_STATUS.SHIELDS_VULNERABLE,
        expected: 'breached'
      },
      {
        playerType: PLAYER_TYPES.PLAYER,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: RAID_STATUS.SHIELDS_VULNERABLE,
        expected: 'breached'
      },
      // Raid map: the defender's command ship decides it, and the raid the
      // player is running is by definition underway.
      {
        playerType: PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: true,
        commandShipAlive: true,
        raidStatus: RAID_STATUS.ONGOING,
        expected: 'secure'
      },
      {
        playerType: PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: false,
        commandShipAlive: true,
        raidStatus: RAID_STATUS.ONGOING,
        expected: 'breached'
      },
      {
        playerType: PLAYER_TYPES.RAID_ENEMY,
        commandShipOnStation: true,
        commandShipAlive: false,
        raidStatus: RAID_STATUS.ONGOING,
        expected: 'breached'
      }
    ];
  });

  // The regression. The fleet is refreshed from the API when the raid starts,
  // and nothing about that told the HUD, so the alpha base kept reading secure
  // until the player reloaded the page.
  departingForARaidTurnsTheAlphaBaseVulnerableTest = new DTest('departingForARaidTurnsTheAlphaBaseVulnerableTest', function() {
    const elementId = `${PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(PLAYER_TYPES.PLAYER, true, true);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');

    player.setFleet(ShieldStatusTest.makeFleet(false));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-vulnerable');
  });

  // The other half of the same regression: the fleet comes home when the raid
  // ends, and the icon has to come back with it.
  returningFromARaidTurnsTheAlphaBaseSecureTest = new DTest('returningFromARaidTurnsTheAlphaBaseSecureTest', function() {
    const elementId = `${PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(PLAYER_TYPES.PLAYER, false, true);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-vulnerable');

    player.setFleet(ShieldStatusTest.makeFleet(true));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');
  });

  // The raid map's defender is a different key player, so a fleet change on one
  // planet must not redraw the other.
  aFleetChangeOnlyRedrawsItsOwnPlanetTest = new DTest('aFleetChangeOnlyRedrawsItsOwnPlanetTest', function() {
    const elementId = `${PLAYER_TYPES.PLAYER}-hud-shield-status`;
    const player = ShieldStatusTest.makePlanetOwner(PLAYER_TYPES.PLAYER, true, true);
    const raidEnemy = ShieldStatusTest.makePlanetOwner(PLAYER_TYPES.RAID_ENEMY, true, true, RAID_STATUS.ONGOING);
    const {elements} = ShieldStatusTest.givenRenderedComponent(player);

    raidEnemy.setFleet(ShieldStatusTest.makeFleet(false));

    this.assertEquals(ShieldStatusTest.shownStatus(elements, elementId), 'shield-secure');
  });
}
