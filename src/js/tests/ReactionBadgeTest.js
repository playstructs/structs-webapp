import {DTest, DTestSuite} from "../framework/DTestFramework";
import {MapStructHUDLayerComponent} from "../view_models/components/map/MapStructHUDLayerComponent";
import {ANIMATION} from "../constants/AnimationConstants";

/**
 * Covers the reaction badge (counter-attack, defender counter, block) that a
 * struct's map tile shows in place of its status icons while it reacts to an attack.
 */
export class ReactionBadgeTest extends DTestSuite {

  constructor() {
    super('ReactionBadgeTest');
  }

  static givenDocument() {
    global.document = {
      createElement: () => {
        const element = {
          parent: null,
          className: '',
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
   * A HUD tile with just enough of the DOM for the badge code.
   */
  static createTile() {
    const classes = new Set();
    const tile = {
      children: [],
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name)
      },
      appendChild: (child) => {
        child.parent = tile;
        tile.children.push(child);
      },
      querySelectorAll: (selector) => tile.children.filter(child => `.${child.className}` === selector)
    };
    return tile;
  }

  /**
   * @param {object} tile
   * @param {object|null} currentEvent the event the animation queue is playing
   * @return {MapStructHUDLayerComponent}
   */
  static givenHUDLayer(tile, currentEvent = null) {
    ReactionBadgeTest.givenDocument();
    const hud = Object.create(MapStructHUDLayerComponent.prototype);
    hud.mapId = 'map-1';
    hud.gameState = {animationEventQueue: {currentEvent}};
    hud.structManager = {getStructById: () => null};
    hud.getHUDTileByStructId = () => tile;
    return hud;
  }

  static animationEvent(structId, badge = null) {
    return {structId, mapId: 'map-1', options: badge ? {badge} : {}};
  }

  static badgesOn(tile) {
    return tile.children.filter(child => child.className === 'map-struct-hud-reaction-badge');
  }

  targetCounterUsesTheCounterAttackIconTest = new DTest('targetCounterUsesTheCounterAttackIconTest', function() {
    this.assertEquals(ANIMATION.BADGES.COUNTER_ATTACK, 'icon-counter-attack');
    this.assertEquals(ANIMATION.BADGES.DEFENDER_COUNTER, 'icon-defender-counter');
    this.assertEquals(ANIMATION.BADGES.BLOCK, 'icon-defender-block');
  });

  showsTheBadgeAndHidesTheHUDWhileReactingTest = new DTest('showsTheBadgeAndHidesTheHUDWhileReactingTest', function() {
    const tile = ReactionBadgeTest.createTile();
    const event = ReactionBadgeTest.animationEvent('5-1', ANIMATION.BADGES.BLOCK);
    const hud = ReactionBadgeTest.givenHUDLayer(tile, event);

    hud.handleAnimation(event);

    this.assertEquals(tile.classList.contains('invisible'), true);
    const badges = ReactionBadgeTest.badgesOn(tile);
    this.assertEquals(badges.length, 1);
    this.assertEquals(badges[0].src, '/img/sui/icon/icon-defender-block.png');
  });

  noBadgeForAnOrdinaryAnimationTest = new DTest('noBadgeForAnOrdinaryAnimationTest', function() {
    const tile = ReactionBadgeTest.createTile();
    const event = ReactionBadgeTest.animationEvent('5-1');
    const hud = ReactionBadgeTest.givenHUDLayer(tile, event);

    hud.handleAnimation(event);

    this.assertEquals(tile.classList.contains('invisible'), true);
    this.assertEquals(ReactionBadgeTest.badgesOn(tile).length, 0);
  });

  removesTheBadgeAndRestoresTheHUDWhenDoneTest = new DTest('removesTheBadgeAndRestoresTheHUDWhenDoneTest', function() {
    const tile = ReactionBadgeTest.createTile();
    const event = ReactionBadgeTest.animationEvent('5-1', ANIMATION.BADGES.COUNTER_ATTACK);
    const hud = ReactionBadgeTest.givenHUDLayer(tile, event);
    hud.handleAnimation(event);

    // The queue has moved on to another struct's animation.
    hud.gameState.animationEventQueue.currentEvent = ReactionBadgeTest.animationEvent('5-9');
    hud.handleAnimationEnd({structId: '5-1', mapId: 'map-1', healthAfter: null});

    this.assertEquals(tile.classList.contains('invisible'), false);
    this.assertEquals(ReactionBadgeTest.badgesOn(tile).length, 0);
  });

  // The queue starts the next animation before the HUD hears the previous one
  // end, so back-to-back animations for one struct must not flash the HUD.
  keepsTheNextAnimationsStateForTheSameStructTest = new DTest('keepsTheNextAnimationsStateForTheSameStructTest', function() {
    const tile = ReactionBadgeTest.createTile();
    const damage = ReactionBadgeTest.animationEvent('5-1');
    const counter = ReactionBadgeTest.animationEvent('5-1', ANIMATION.BADGES.COUNTER_ATTACK);
    const hud = ReactionBadgeTest.givenHUDLayer(tile, damage);
    hud.handleAnimation(damage);

    hud.gameState.animationEventQueue.currentEvent = counter;
    hud.handleAnimation(counter);
    hud.handleAnimationEnd({structId: '5-1', mapId: 'map-1', healthAfter: null});

    this.assertEquals(tile.classList.contains('invisible'), true);
    const badges = ReactionBadgeTest.badgesOn(tile);
    this.assertEquals(badges.length, 1);
    this.assertEquals(badges[0].src, '/img/sui/icon/icon-counter-attack.png');
  });

  ignoresAnimationsOnOtherMapsTest = new DTest('ignoresAnimationsOnOtherMapsTest', function() {
    const tile = ReactionBadgeTest.createTile();
    const event = {structId: '5-1', mapId: 'map-2', options: {badge: ANIMATION.BADGES.BLOCK}};
    const hud = ReactionBadgeTest.givenHUDLayer(tile, event);

    hud.handleAnimation(event);

    this.assertEquals(tile.classList.contains('invisible'), false);
    this.assertEquals(ReactionBadgeTest.badgesOn(tile).length, 0);
  });
}
