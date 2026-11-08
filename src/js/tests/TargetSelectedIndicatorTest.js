import {DTest, DTestSuite} from "../framework/DTestFramework";
import {TARGET_SELECTED_VARIANTS, TargetSelectedIndicator} from "../view_models/components/map/TargetSelectedIndicator";
import {MapTileSelectionComponent} from "../view_models/components/map/MapTileSelectionComponent";
import {STRUCT_ACTIONS} from "../constants/StructConstants";

/**
 * Covers the burst that plays on a tile once the player picks a valid target
 * for an attack, a defend or a move.
 */
export class TargetSelectedIndicatorTest extends DTestSuite {

  constructor() {
    super('TargetSelectedIndicatorTest');
  }

  /**
   * Stands in for the document with only what the indicator reaches for.
   */
  static givenDocument() {
    global.document = {
      createElement: () => {
        const element = {
          parent: null,
          remove: () => {
            if (element.parent) {
              element.parent.children.splice(element.parent.children.indexOf(element), 1);
              element.parent = null;
            }
          }
        };
        return element;
      }
    };
  }

  /**
   * @return {{children: object[], appendChild: function(object), getAttribute: function(string): string}}
   */
  static createTile() {
    const tile = {
      children: [],
      appendChild: (child) => {
        child.parent = tile;
        tile.children.push(child);
      },
      getAttribute: (name) => name === 'data-struct-id' ? '5-2' : '1'
    };
    return tile;
  }

  /**
   * A tile selection layer far enough along for its target click handlers to run.
   *
   * @return {MapTileSelectionComponent}
   */
  static givenTileSelection() {
    const actionSourceStruct = {id: '5-1', type: 1, location_type: 'fleet'};
    const gameState = {
      actionBarLock: {
        lock: () => {},
        getActionSourceStruct: () => actionSourceStruct
      },
      structTypes: {getStructTypeById: () => ({})}
    };
    const signingClientManager = {
      queueMsgStructAttack: async () => {},
      queueMsgStructDefenseSet: async () => {},
      queueMsgStructMove: async () => {}
    };

    const tileSelection = new MapTileSelectionComponent(gameState, signingClientManager, null, [], null, null, null, null, null);
    // Moving re-points the focus cursor at the new tile, which isn't what these tests are about.
    tileSelection.addFocusToSourceTile = () => {};
    return tileSelection;
  }

  playsTheRequestedVariantOnTheTileTest = new DTest('playsTheRequestedVariantOnTheTileTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tile = TargetSelectedIndicatorTest.createTile();

    TargetSelectedIndicator.play(tile, TARGET_SELECTED_VARIANTS.FRIENDLY);

    this.assertEquals(tile.children.length, 1);
    this.assertEquals(tile.children[0].className, 'map-tile-target-selected');
    this.assertEquals(tile.children[0].src, '/img/focus/target-selected-friendly.gif');

    TargetSelectedIndicator.stop(tile);
  });

  // Selecting the same tile again restarts the burst rather than stacking a second one.
  replayingATileReplacesTheBurstTest = new DTest('replayingATileReplacesTheBurstTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tile = TargetSelectedIndicatorTest.createTile();

    TargetSelectedIndicator.play(tile, TARGET_SELECTED_VARIANTS.ENEMY);
    TargetSelectedIndicator.play(tile, TARGET_SELECTED_VARIANTS.ENEMY);

    this.assertEquals(tile.children.length, 1);

    TargetSelectedIndicator.stop(tile);

    this.assertEquals(tile.children.length, 0);
  });

  // Each play gets its own URL so the gif starts over instead of showing its blank last frame.
  downloadedArtPlaysFromAFreshUrlEachTimeTest = new DTest('downloadedArtPlaysFromAFreshUrlEachTimeTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tile = TargetSelectedIndicatorTest.createTile();
    TargetSelectedIndicator.blobs[TARGET_SELECTED_VARIANTS.NEUTRAL] = new Blob(['gif'], {type: 'image/gif'});

    TargetSelectedIndicator.play(tile, TARGET_SELECTED_VARIANTS.NEUTRAL);
    const firstSrc = tile.children[0].src;
    TargetSelectedIndicator.play(tile, TARGET_SELECTED_VARIANTS.NEUTRAL);
    const secondSrc = tile.children[0].src;

    this.assertEquals(firstSrc.startsWith('blob:'), true);
    this.assertEquals(firstSrc !== secondSrc, true);

    TargetSelectedIndicator.stop(tile);
    delete TargetSelectedIndicator.blobs[TARGET_SELECTED_VARIANTS.NEUTRAL];
  });

  attackTargetPlaysTheOffensiveBurstTest = new DTest('attackTargetPlaysTheOffensiveBurstTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tileSelection = TargetSelectedIndicatorTest.givenTileSelection();
    const tile = TargetSelectedIndicatorTest.createTile();

    tileSelection.handleAttackTargetClick(tile, STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON);

    this.assertEquals(tile.children[0].src, '/img/focus/target-selected-enemy.gif');

    TargetSelectedIndicator.stop(tile);
  });

  defendTargetPlaysTheDefensiveBurstTest = new DTest('defendTargetPlaysTheDefensiveBurstTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tileSelection = TargetSelectedIndicatorTest.givenTileSelection();
    const tile = TargetSelectedIndicatorTest.createTile();

    tileSelection.handleDefendTargetClick(tile);

    this.assertEquals(tile.children[0].src, '/img/focus/target-selected-friendly.gif');

    TargetSelectedIndicator.stop(tile);
  });

  moveTargetPlaysTheNeutralBurstTest = new DTest('moveTargetPlaysTheNeutralBurstTest', function() {
    TargetSelectedIndicatorTest.givenDocument();
    const tileSelection = TargetSelectedIndicatorTest.givenTileSelection();
    const tile = TargetSelectedIndicatorTest.createTile();

    tileSelection.handleMoveTargetClick(tile);

    this.assertEquals(tile.children[0].src, '/img/focus/target-selected-neutral.gif');

    TargetSelectedIndicator.stop(tile);
  });
}
