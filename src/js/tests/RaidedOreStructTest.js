import {DTest, DTestSuite} from "../framework/DTestFramework";
import {StructManager} from "../managers/StructManager";
import {KeyPlayer} from "../models/KeyPlayer";
import {Struct} from "../models/Struct";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {RAID_STATUS} from "../constants/RaidStatus";
import {MAP_TYPES} from "../constants/MapConstants";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";

/**
 * Covers extractors and refineries on a planet under raid. The chain refuses
 * mining and refining while a raider is on the planet, so the map and action
 * bar flag those structs and their active loop is held until the raid ends.
 */
export class RaidedOreStructTest extends DTestSuite {

  static HOME_PLANET_ID = '2-1';
  static ENEMY_PLANET_ID = '2-2';

  constructor() {
    super('RaidedOreStructTest');
  }

  /**
   * @param {{isExtractor?: boolean, isRefinery?: boolean}} structTypeFlags
   * @return {object}
   */
  static givenGameState({isExtractor = true, isRefinery = false} = {}) {
    const keyPlayers = {};

    Object.values(PLAYER_TYPES).forEach(playerType => {
      keyPlayers[playerType] = new KeyPlayer(playerType, true, MAP_TYPES.ALPHA_BASE);
    });

    return {
      keyPlayers: keyPlayers,
      structTypes: {
        getStructTypeById: () => ({
          hasPlanetaryMining: () => isExtractor,
          hasPlanetaryRefinery: () => isRefinery
        })
      }
    };
  }

  /**
   * @param {object} gameState
   * @param {string} playerType
   * @param {string} planetId
   * @param {string} status
   */
  static givenRaid(gameState, playerType, planetId, status) {
    gameState.keyPlayers[playerType].planetRaidInfo.planet_id = planetId;
    gameState.keyPlayers[playerType].planetRaidInfo.status = status;
  }

  /**
   * @param {string} planetId
   * @param {number} status
   * @return {Struct}
   */
  static makePlanetaryStruct(planetId, status = STRUCT_STATUS_FLAGS.BUILT | STRUCT_STATUS_FLAGS.ONLINE) {
    const struct = new Struct();
    struct.id = '5-1';
    struct.location_type = 'planet';
    struct.location_id = planetId;
    struct.status = status;
    struct.destroyed_block = (status & STRUCT_STATUS_FLAGS.DESTROYED) ? 1 : 0;
    return struct;
  }

  extractorOnRaidedHomePlanetIsHaltedTest = new DTest('extractorOnRaidedHomePlanetIsHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState();
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.PLAYER, RaidedOreStructTest.HOME_PLANET_ID, RAID_STATUS.ONGOING);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.HOME_PLANET_ID)),
      true
    );
  });

  refineryOnPlanetThePlayerRaidsIsHaltedTest = new DTest('refineryOnPlanetThePlayerRaidsIsHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState({isExtractor: false, isRefinery: true});
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.RAID_ENEMY, RaidedOreStructTest.ENEMY_PLANET_ID, RAID_STATUS.SHIELDS_VULNERABLE);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.ENEMY_PLANET_ID)),
      true
    );
  });

  // Once the raid is over the active loop resumes.
  extractorAfterRaidEndsIsNotHaltedTest = new DTest('extractorAfterRaidEndsIsNotHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState();
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.PLAYER, RaidedOreStructTest.HOME_PLANET_ID, RAID_STATUS.ATTACKER_DEFEATED);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.HOME_PLANET_ID)),
      false
    );
  });

  extractorOnAnotherPlanetIsNotHaltedTest = new DTest('extractorOnAnotherPlanetIsNotHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState();
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.PLAYER, RaidedOreStructTest.HOME_PLANET_ID, RAID_STATUS.ONGOING);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.ENEMY_PLANET_ID)),
      false
    );
  });

  nonOreStructOnRaidedPlanetIsNotHaltedTest = new DTest('nonOreStructOnRaidedPlanetIsNotHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState({isExtractor: false, isRefinery: false});
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.PLAYER, RaidedOreStructTest.HOME_PLANET_ID, RAID_STATUS.ONGOING);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.HOME_PLANET_ID)),
      false
    );
  });

  destroyedOrUnbuiltExtractorIsNotHaltedTest = new DTest('destroyedOrUnbuiltExtractorIsNotHaltedTest', function() {
    const gameState = RaidedOreStructTest.givenGameState();
    RaidedOreStructTest.givenRaid(gameState, PLAYER_TYPES.PLAYER, RaidedOreStructTest.HOME_PLANET_ID, RAID_STATUS.ONGOING);
    const structManager = new StructManager(gameState, null, null);

    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(
        RaidedOreStructTest.HOME_PLANET_ID,
        STRUCT_STATUS_FLAGS.BUILT | STRUCT_STATUS_FLAGS.DESTROYED
      )),
      false
    );
    this.assertEquals(
      structManager.isOreWorkHaltedByRaid(RaidedOreStructTest.makePlanetaryStruct(RaidedOreStructTest.HOME_PLANET_ID, 0)),
      false
    );
  });
}
