import {DTest, DTestSuite} from "../framework/DTestFramework";
import {StructManager} from "../managers/StructManager";
import {DestroyedStructManager} from "../managers/DestroyedStructManager";
import {GenericMapLayerComponent} from "../view_models/components/map/GenericMapLayerComponent";
import {KeyPlayer} from "../models/KeyPlayer";
import {Struct} from "../models/Struct";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";
import {MAP_COL_DIVIDER, MAP_TYPES} from "../constants/MapConstants";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";

/**
 * Covers the planetary structs a player leaves behind when they depart a fully
 * mined planet. The chain keeps reporting on those structs after the player has
 * arrived somewhere new, and the map matches tiles by owner, ambit and slot
 * alone, so the old structs were drawn as destroyed on the new planet's tiles
 * in the same positions.
 */
export class AbandonedPlanetaryStructTest extends DTestSuite {

  static OLD_PLANET_ID = '2-1';
  static NEW_PLANET_ID = '2-2';
  static PLAYER_ID = '1-1';

  constructor() {
    super('AbandonedPlanetaryStructTest');
  }

  /**
   * @return {object}
   */
  static givenGameStateAfterArrival() {
    const keyPlayers = {};

    Object.values(PLAYER_TYPES).forEach(playerType => {
      keyPlayers[playerType] = new KeyPlayer(playerType, true, MAP_TYPES.ALPHA_BASE);
    });

    keyPlayers[PLAYER_TYPES.PLAYER].id = AbandonedPlanetaryStructTest.PLAYER_ID;
    keyPlayers[PLAYER_TYPES.PLAYER].player = {planet_id: AbandonedPlanetaryStructTest.NEW_PLANET_ID};

    return {
      keyPlayers: keyPlayers,
      currentBlockHeight: 100,
      settings: {get: () => 5}
    };
  }

  /**
   * @param {string} planetId
   * @param {boolean} destroyed
   * @return {Struct}
   */
  static makePlanetaryStruct(planetId, destroyed = false) {
    const struct = new Struct();
    struct.id = '5-9';
    struct.owner = AbandonedPlanetaryStructTest.PLAYER_ID;
    struct.location_type = 'planet';
    struct.location_id = planetId;
    struct.operating_ambit = 'land';
    struct.slot = 0;
    struct.status = destroyed
      ? STRUCT_STATUS_FLAGS.BUILT | STRUCT_STATUS_FLAGS.DESTROYED
      : STRUCT_STATUS_FLAGS.BUILT;
    struct.destroyed_block = destroyed ? 1 : 0;
    return struct;
  }

  /**
   * Stands up the one tile a planetary struct in the land ambit's first slot
   * would be drawn on.
   *
   * @return {object}
   */
  static givenTileOnTheMap() {
    const tile = {};
    global.document = {
      getElementById: () => ({querySelector: () => tile})
    };
    return tile;
  }

  structLeftOnTheOldPlanetIsAbandonedTest = new DTest('structLeftOnTheOldPlanetIsAbandonedTest', function() {
    const structManager = new StructManager(AbandonedPlanetaryStructTest.givenGameStateAfterArrival(), null, null);

    this.assertEquals(
      structManager.isAbandonedPlanetaryStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID)
      ),
      true
    );
    this.assertEquals(
      structManager.isAbandonedPlanetaryStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.NEW_PLANET_ID)
      ),
      false
    );
  });

  // The raid enemy key player is wiped when a raid ends, while its structs may
  // still be waiting to be swept.
  structWithAnOwnerNoLongerTrackedIsNotAbandonedTest = new DTest('structWithAnOwnerNoLongerTrackedIsNotAbandonedTest', function() {
    const structManager = new StructManager(AbandonedPlanetaryStructTest.givenGameStateAfterArrival(), null, null);
    const struct = AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID);
    struct.owner = '1-99';

    this.assertEquals(structManager.isAbandonedPlanetaryStruct(struct), false);
  });

  // The regression: the old struct was drawn onto the new planet's tile.
  mapDoesNotDrawAStructFromAnotherPlanetTest = new DTest('mapDoesNotDrawAStructFromAnotherPlanetTest', function() {
    const gameState = AbandonedPlanetaryStructTest.givenGameStateAfterArrival();
    const tile = AbandonedPlanetaryStructTest.givenTileOnTheMap();
    const mapLayer = new GenericMapLayerComponent(
      gameState,
      'row',
      'tile',
      new StructManager(gameState, null, null),
      [MAP_COL_DIVIDER],
      {id: AbandonedPlanetaryStructTest.NEW_PLANET_ID},
      null,
      null
    );

    this.assertEquals(
      mapLayer.buildMapStructTilRenderParamsFromStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID, true)
      ),
      null
    );
    this.assertEquals(
      mapLayer.buildMapStructTilRenderParamsFromStruct(
        AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.NEW_PLANET_ID)
      ).tileElement,
      tile
    );
  });

  // A struct destroyed on the old planet just before departing is still being
  // tracked, and sweeping it must not clear what now sits in its old slot.
  sweepingAnAbandonedStructLeavesTheNewPlanetsTileAloneTest = new DTest('sweepingAnAbandonedStructLeavesTheNewPlanetsTileAloneTest', function() {
    const gameState = AbandonedPlanetaryStructTest.givenGameStateAfterArrival();
    gameState[MAP_TYPES.ALPHA_BASE] = {mapId: 'alpha-base-map'};
    const structManager = new StructManager(gameState, null, null);
    structManager.getMapIdByPlayerTypeAndStruct = () => 'alpha-base-map';

    const destroyedStructManager = new DestroyedStructManager(gameState, structManager);
    destroyedStructManager.track(
      PLAYER_TYPES.PLAYER,
      AbandonedPlanetaryStructTest.makePlanetaryStruct(AbandonedPlanetaryStructTest.OLD_PLANET_ID, true)
    );

    let tilesCleared = 0;
    const countClear = () => tilesCleared++;
    window.addEventListener(EVENTS.CLEAR_STRUCT_TILE, countClear);

    destroyedStructManager.sweep();

    window.removeEventListener(EVENTS.CLEAR_STRUCT_TILE, countClear);

    this.assertEquals(tilesCleared, 0);
    this.assertEquals(Object.keys(destroyedStructManager.destroyedStructs).length, 0);
  });
}
