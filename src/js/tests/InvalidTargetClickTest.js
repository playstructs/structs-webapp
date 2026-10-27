import {DTest, DTestSuite} from "../framework/DTestFramework";
import {MapTileSelectionComponent} from "../view_models/components/map/MapTileSelectionComponent";
import {STRUCT_ACTIONS} from "../constants/StructConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";

/**
 * Covers clicking the map while an action is waiting on a target.
 *
 * An invalid click used to cancel the action and focus whatever was clicked,
 * which testers read as the action having gone through. Now only a valid
 * target does anything; every other click is ignored.
 */
export class InvalidTargetClickTest extends DTestSuite {

  constructor() {
    super('InvalidTargetClickTest');
  }

  /**
   * @param {{structId?: string, playerId?: string, classes?: string[]}} options
   * @return {object}
   */
  static createTile({structId = '', playerId = '', classes = []} = {}) {
    const classSet = new Set(classes);
    const attributes = {'data-struct-id': structId, 'data-player-id': playerId};

    return {
      dataset: {structId: structId, playerId: playerId},
      classList: {contains: (name) => classSet.has(name)},
      getAttribute: (name) => attributes[name] ?? null,
      addEventListener(type, handler) {
        this.clickHandler = handler;
      }
    };
  }

  /**
   * Stands up a tile selection layer with the given tile on it and an action
   * waiting on a target, recording whatever the click goes on to do.
   *
   * @param {string} currentAction see STRUCT_ACTIONS
   * @param {object} tile
   * @return {{click: function(): void, calls: string[]}}
   */
  static givenTargetSelectionMode(currentAction, tile) {
    const calls = [];
    const sharedWindow = global.window;

    global.document = {
      getElementById: () => ({querySelectorAll: () => [tile]})
    };

    const gameState = {
      keyPlayers: {[PLAYER_TYPES.PLAYER]: {id: '1-1'}},
      actionBarLock: {
        isLocked: () => false,
        getCurrentAction: () => currentAction,
        getActionSourceStruct: () => ({id: '5-1'}),
        clear: () => calls.push('clear')
      }
    };

    const tileSelection = new MapTileSelectionComponent(gameState, null, null, [], null, null, null, null, null);
    tileSelection.handleMoveTargetClick = async () => calls.push('move');
    tileSelection.handleDefendTargetClick = async () => calls.push('defend');
    tileSelection.handleAttackTargetClick = async () => calls.push('attack');
    tileSelection.addFocusToSourceTile = () => calls.push('focus');
    tileSelection.attackTargetUtil = {
      getActiveWeaponAmbitsArray: () => ['space'],
      isValidTargetById: (structId) => structId === '5-9'
    };

    // initPageCode also listens on the window; keep those listeners out of the shared one.
    global.window = {addEventListener: () => {}, dispatchEvent: (event) => calls.push(event.type)};
    tileSelection.initPageCode();

    return {
      // DTest runs synchronously; everything a click decides happens before its first await.
      click: () => {
        try {
          tile.clickHandler({currentTarget: tile});
        } finally {
          global.window = sharedWindow;
        }
      },
      calls: calls
    };
  }

  emptyTileInMoveModeDoesNothingTest = new DTest('emptyTileInMoveModeDoesNothingTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.MOVE,
      InvalidTargetClickTest.createTile()
    );

    click();

    this.assertEquals(calls.join(','), '');
  });

  moveMarkerTileMovesTest = new DTest('moveMarkerTileMovesTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.MOVE,
      InvalidTargetClickTest.createTile({classes: ['focus-move']})
    );

    click();

    this.assertEquals(calls.join(','), 'move');
  });

  enemyStructInDefendModeDoesNothingTest = new DTest('enemyStructInDefendModeDoesNothingTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.DEFENSE_SET,
      InvalidTargetClickTest.createTile({structId: '5-9', playerId: '1-2'})
    );

    click();

    this.assertEquals(calls.join(','), '');
  });

  defendingStructItselfDoesNothingTest = new DTest('defendingStructItselfDoesNothingTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.DEFENSE_SET,
      InvalidTargetClickTest.createTile({structId: '5-1', playerId: '1-1'})
    );

    click();

    this.assertEquals(calls.join(','), '');
  });

  friendlyStructInDefendModeDefendsTest = new DTest('friendlyStructInDefendModeDefendsTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.DEFENSE_SET,
      InvalidTargetClickTest.createTile({structId: '5-2', playerId: '1-1'})
    );

    click();

    this.assertEquals(calls.join(','), 'defend');
  });

  unreachableStructInAttackModeDoesNothingTest = new DTest('unreachableStructInAttackModeDoesNothingTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON,
      InvalidTargetClickTest.createTile({structId: '5-3', playerId: '1-2'})
    );

    click();

    this.assertEquals(calls.join(','), '');
  });

  validStructInAttackModeAttacksTest = new DTest('validStructInAttackModeAttacksTest', function() {
    const {click, calls} = InvalidTargetClickTest.givenTargetSelectionMode(
      STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON,
      InvalidTargetClickTest.createTile({structId: '5-9', playerId: '1-2'})
    );

    click();

    this.assertEquals(calls.join(','), 'attack');
  });
}
