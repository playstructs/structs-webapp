import {DTest, DTestSuite} from "../framework/DTestFramework";
import {PlanetCardBuilder} from "../builders/PlanetCardBuilder";
import {PLANET_CARD_TYPES} from "../constants/PlanetCardTypes";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {KeyPlayer} from "../models/KeyPlayer";
import {Player} from "../models/Player";
import {MenuPage} from "../framework/MenuPage";
import {NewPlanetListener} from "../grass_listeners/NewPlanetListener";
import {ConnectionCapacityListener} from "../grass_listeners/ConnectionCapacityListener";
import {PlayerCapacityListener} from "../grass_listeners/PlayerCapacityListener";
import {PlayerLoadListener} from "../grass_listeners/PlayerLoadListener";
import {PlayerStructsLoadListener} from "../grass_listeners/PlayerStructsLoadListener";
import {PlayerSubstationListener} from "../grass_listeners/PlayerSubstationListener";
import {EVENTS} from "../constants/Events";
import {EnergyUsageChangedEvent} from "../events/EnergyUsageChangedEvent";

/**
 * Covers departing a completed planet. The chain refuses to let a player explore
 * while they draw more energy than they have, and the card used to wait forever
 * for the planet that never came.
 */
export class PlanetCardDepartTest extends DTestSuite {

  constructor() {
    super('PlanetCardDepartTest');
  }

  static TOOLTIP = 'Insufficient Energy. Deactivate Structs to reduce Energy draw.';

  /**
   * @param {number} structsLoad
   * @param {number} connectionCapacity
   */
  static given(structsLoad, connectionCapacity) {
    const keyPlayer = new KeyPlayer(PLAYER_TYPES.PLAYER, false);
    keyPlayer.id = '1-303';
    keyPlayer.player = new Player();
    keyPlayer.player.id = '1-303';
    keyPlayer.player.substation_id = '4-1';
    keyPlayer.player.load = 0;
    keyPlayer.player.structs_load = structsLoad;
    keyPlayer.player.capacity = 0;
    keyPlayer.player.connection_capacity = connectionCapacity;
    keyPlayer.player.ore = 14;
    keyPlayer.planet = {name: 'Llubu Rho', undiscovered_ore: 0};
    keyPlayer.isCommandStructOnPlanet = () => true;

    const grassManager = {
      listeners: new Map(),
      registerListener: (listener) => grassManager.listeners.set(listener.name, listener),
      getListener: (name) => grassManager.listeners.get(name),
      unregisterListener: (name) => grassManager.listeners.delete(name)
    };

    const gameState = {
      keyPlayers: {
        [PLAYER_TYPES.PLAYER]: keyPlayer,
        [PLAYER_TYPES.RAID_ENEMY]: {planetRaidInfo: {isRaidActive: () => false}}
      }
    };

    const planetManager = {explores: 0, findNewPlanet: () => {
      planetManager.explores++;
      return new Promise(() => {});
    }};

    const builder = new PlanetCardBuilder(
      gameState,
      null,
      grassManager,
      null,
      planetManager,
      null,
      null,
      {getStructCountByPlayerType: () => '16+9'}
    );

    return {keyPlayer, gameState, grassManager, planetManager, builder};
  }

  static createFakeElement(className = '') {
    const classes = new Set(className.split(' '));
    const listeners = [];
    return {
      dataset: {},
      classList: {
        toggle: (name, on) => on ? classes.add(name) : classes.delete(name),
        contains: (name) => classes.has(name)
      },
      addEventListener: (type, handler) => listeners.push(handler),
      click: () => listeners.forEach(handler => handler({}))
    };
  }

  /**
   * Runs a test with its own page, router and window listeners, so that cards
   * other tests left on the shared window don't react here.
   *
   * @param {Object<string, object>} elements
   * @param {function} test
   */
  static withPage(elements, test) {
    const sharedDocument = global.document;
    const sharedRouter = MenuPage.router;
    const sharedWindow = global.window;
    const visited = [];
    const listeners = {};

    global.window = {
      addEventListener: (type, handler) => (listeners[type] = listeners[type] || []).push(handler),
      removeEventListener: (type, handler) => {
        listeners[type] = (listeners[type] || []).filter(registered => registered !== handler);
      },
      dispatchEvent: (event) => (listeners[event.type] || []).slice().forEach(handler => handler(event))
    };
    global.document = {getElementById: (id) => elements[id] ?? null};
    MenuPage.router = {goto: (controller, page, options) => visited.push(options?.planetCardType)};

    try {
      test(visited, listeners);
    } finally {
      global.window = sharedWindow;
      global.document = sharedDocument;
      MenuPage.router = sharedRouter;
    }
  }

  static setUpCard(card, elements) {
    // Nothing but the buttons is under test.
    card.hasStatusGroup = false;
    card.initPageCode();
    return elements;
  }

  departIsDisabledWhileOverloadedTest = new DTest('departIsDisabledWhileOverloadedTest', function() {
    const {builder} = PlanetCardDepartTest.given(5925, 5160);

    const depart = builder.buildAlphaBaseCard().renderSecondaryBtnHTML();
    this.assertEquals(depart.includes('sui-mod-disabled'), true);
    this.assertEquals(depart.includes('sui-mod-secondary'), false);
    this.assertEquals(depart.includes(`data-sui-tooltip="${PlanetCardDepartTest.TOOLTIP}"`), true);

    const confirmCard = builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_DEPART);
    this.assertEquals(confirmCard.renderPrimaryBtnHTML().includes('sui-mod-disabled'), true);
    this.assertEquals(confirmCard.renderPrimaryBtnHTML().includes(PlanetCardDepartTest.TOOLTIP), true);
    this.assertEquals(confirmCard.renderSecondaryBtnHTML().includes('sui-mod-disabled'), false);
  });

  departIsEnabledWithEnoughEnergyTest = new DTest('departIsEnabledWithEnoughEnergyTest', function() {
    // Drawing exactly what is available is still online.
    const {builder} = PlanetCardDepartTest.given(5160, 5160);

    const depart = builder.buildAlphaBaseCard().renderSecondaryBtnHTML();
    this.assertEquals(depart.includes('sui-mod-secondary'), true);
    this.assertEquals(depart.includes('sui-mod-disabled'), false);
    this.assertEquals(depart.includes('data-sui-tooltip'), false);
  });

  commandIsNeverDisabledTest = new DTest('commandIsNeverDisabledTest', function() {
    const {builder} = PlanetCardDepartTest.given(5925, 5160);
    this.assertEquals(builder.buildAlphaBaseCard().renderPrimaryBtnHTML().includes('sui-mod-disabled'), false);
  });

  departFollowsEnergyWhileOnThePageTest = new DTest('departFollowsEnergyWhileOnThePageTest', function() {
    const {keyPlayer, builder} = PlanetCardDepartTest.given(5925, 5160);
    const card = builder.buildAlphaBaseCard();
    const departBtn = PlanetCardDepartTest.createFakeElement('sui-screen-btn sui-mod-disabled');
    const elements = {
      [card.primaryBtnId]: PlanetCardDepartTest.createFakeElement(),
      [card.secondaryBtnId]: departBtn
    };

    PlanetCardDepartTest.withPage(elements, (visited) => {
      PlanetCardDepartTest.setUpCard(card, elements);

      departBtn.click();
      this.assertEquals(visited.length, 0);

      keyPlayer.player.capacity = 960;
      window.dispatchEvent(new EnergyUsageChangedEvent(PLAYER_TYPES.PLAYER));
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), false);
      this.assertEquals(departBtn.classList.contains('sui-mod-secondary'), true);
      this.assertEquals(departBtn.dataset.suiTooltip, undefined);

      departBtn.click();
      this.assertEquals(visited[0], PLANET_CARD_TYPES.ALPHA_BASE_DEPART);

      keyPlayer.player.capacity = 0;
      window.dispatchEvent(new EnergyUsageChangedEvent(PLAYER_TYPES.PLAYER));
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), true);
      this.assertEquals(departBtn.dataset.suiTooltip, PlanetCardDepartTest.TOOLTIP);
    });
  });

  confirmDoesNotExploreWhileOverloadedTest = new DTest('confirmDoesNotExploreWhileOverloadedTest', function() {
    const {keyPlayer, planetManager, grassManager, builder} = PlanetCardDepartTest.given(5925, 5160);
    const card = builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_DEPART);
    const confirmBtn = PlanetCardDepartTest.createFakeElement();
    const elements = {
      [card.primaryBtnId]: confirmBtn,
      [card.secondaryBtnId]: PlanetCardDepartTest.createFakeElement()
    };

    PlanetCardDepartTest.withPage(elements, (visited) => {
      PlanetCardDepartTest.setUpCard(card, elements);

      confirmBtn.click();
      this.assertEquals(planetManager.explores, 0);
      this.assertEquals(grassManager.listeners.size, 0);

      keyPlayer.player.capacity = 960;
      confirmBtn.click();
      this.assertEquals(planetManager.explores, 1);
      this.assertEquals(visited[0], PLANET_CARD_TYPES.ALPHA_BASE_LOADING);
      this.assertEquals(builder.determineAlphaBaseCardType(visited[0]), PLANET_CARD_TYPES.ALPHA_BASE_LOADING);
    });
  });

  refusedExploreHandsTheCardBackTest = new DTest('refusedExploreHandsTheCardBackTest', function() {
    const {grassManager, builder} = PlanetCardDepartTest.given(5925, 5160);
    const listener = new NewPlanetListener({}, null, null);
    grassManager.registerListener(listener);

    PlanetCardDepartTest.withPage({[builder.alphaBaseLoadingId]: {}}, (visited) => {
      builder.departFailed(listener, 'refused');
      this.assertEquals(grassManager.listeners.size, 0);
      this.assertEquals(visited[0], PLANET_CARD_TYPES.ALPHA_BASE_DEPART_FAILED);
    });

    const card = builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_DEPART_FAILED);
    this.assertEquals(card.alertMessage, 'Failed to depart.');
    this.assertEquals(card.renderSecondaryBtnHTML().includes(PlanetCardDepartTest.TOOLTIP), true);
  });

  refusedExploreLeavesOtherPagesAloneTest = new DTest('refusedExploreLeavesOtherPagesAloneTest', function() {
    const {grassManager, builder} = PlanetCardDepartTest.given(5925, 5160);
    const retry = new NewPlanetListener({}, null, null);
    grassManager.registerListener(retry);

    PlanetCardDepartTest.withPage({}, (visited) => {
      builder.departFailed(new NewPlanetListener({}, null, null), 'refused');
      this.assertEquals(visited.length, 0);
      this.assertEquals(grassManager.listeners.get(retry.name) === retry, true);
    });
  });

  restoredPageDoesNotWaitForeverTest = new DTest('restoredPageDoesNotWaitForeverTest', function() {
    const {keyPlayer, builder} = PlanetCardDepartTest.given(5925, 5160);

    this.assertEquals(
      builder.determineAlphaBaseCardType(PLANET_CARD_TYPES.ALPHA_BASE_LOADING),
      PLANET_CARD_TYPES.ALPHA_BASE_COMPLETED
    );

    keyPlayer.planet.undiscovered_ore = 5;
    this.assertEquals(
      builder.determineAlphaBaseCardType(PLANET_CARD_TYPES.ALPHA_BASE_DEPART_FAILED),
      PLANET_CARD_TYPES.ALPHA_BASE_ACTIVE
    );
  });

  departFollowsGrassEnergyMessagesTest = new DTest('departFollowsGrassEnergyMessagesTest', function(params) {
    const {gameState, builder} = PlanetCardDepartTest.given(5925, params.connectionCapacity);
    const card = builder.buildAlphaBaseCard();
    const departBtn = PlanetCardDepartTest.createFakeElement('sui-screen-btn');
    const elements = {
      [card.primaryBtnId]: PlanetCardDepartTest.createFakeElement(),
      [card.secondaryBtnId]: departBtn
    };
    const listeners = [
      new PlayerLoadListener(gameState),
      new PlayerStructsLoadListener(gameState),
      new PlayerCapacityListener(gameState),
      new ConnectionCapacityListener(gameState)
    ];

    PlanetCardDepartTest.withPage(elements, () => {
      PlanetCardDepartTest.setUpCard(card, elements);

      listeners.forEach(listener => listener.handler(params.message));
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), params.disabled);
    });
  }, () => {
    const player = (category, value) => ({category, value, subject: 'structs.grid.player.1-303.1-303'});
    const substation = (id, value) => ({category: 'connectionCapacity', value, subject: `structs.grid.substation.${id}.1-1`});

    return [
      // Alpha infused, structs powered down, the substation given more energy
      {connectionCapacity: 5160, message: player('capacity', 960), disabled: false},
      {connectionCapacity: 5160, message: player('structsLoad', 4925), disabled: false},
      {connectionCapacity: 5160, message: substation('4-1', 8000), disabled: false},
      // Not enough to make up the difference
      {connectionCapacity: 5160, message: player('capacity', 764), disabled: true},
      // Others joining the substation, energy allocated away, structs powered up
      {connectionCapacity: 7393, message: substation('4-1', 5160), disabled: true},
      {connectionCapacity: 7393, message: player('load', 2000), disabled: true},
      {connectionCapacity: 7393, message: player('structsLoad', 7500), disabled: true}
    ];
  });

  departFollowsThePlayerToAnotherSubstationTest = new DTest('departFollowsThePlayerToAnotherSubstationTest', function() {
    const {keyPlayer, gameState, builder} = PlanetCardDepartTest.given(5925, 7393);
    const card = builder.buildAlphaBaseCard();
    const departBtn = PlanetCardDepartTest.createFakeElement('sui-screen-btn sui-mod-secondary');
    const elements = {
      [card.primaryBtnId]: PlanetCardDepartTest.createFakeElement(),
      [card.secondaryBtnId]: departBtn
    };

    let reads = 0;
    const substationListener = new PlayerSubstationListener(gameState, {
      getPlayer: (id) => {
        reads++;
        const player = {id, substation_id: '4-19', connection_capacity: 5160};
        return {then: (callback) => { callback(player); return {catch: () => {}}; }};
      }
    });
    const connectionCapacityListener = new ConnectionCapacityListener(gameState);
    const consensus = (id, substation_id) => ({
      category: 'player_consensus', subject: `structs.player.0-8.${id}`, id, substation_id
    });

    PlanetCardDepartTest.withPage(elements, () => {
      PlanetCardDepartTest.setUpCard(card, elements);

      substationListener.handler(consensus('1-404', '4-19'));
      substationListener.handler(consensus('1-303', '4-1'));
      this.assertEquals(reads, 0);
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), false);

      substationListener.handler(consensus('1-303', '4-19'));
      this.assertEquals(reads, 1);
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), true);

      // The old substation no longer matters, the new one does.
      connectionCapacityListener.handler({category: 'connectionCapacity', value: 9000, subject: 'structs.grid.substation.4-1.1-1'});
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), true);
      connectionCapacityListener.handler({category: 'connectionCapacity', value: 8000, subject: 'structs.grid.substation.4-19.1-508'});
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), false);

      // Disconnected altogether
      substationListener.handler(consensus('1-303', ''));
      this.assertEquals(keyPlayer.player.connection_capacity, 0);
      this.assertEquals(departBtn.classList.contains('sui-mod-disabled'), true);
    });
  });

  nextCardReplacesTheEnergyListenerTest = new DTest('nextCardReplacesTheEnergyListenerTest', function() {
    const {keyPlayer, builder} = PlanetCardDepartTest.given(5925, 5160);
    const cards = [
      builder.buildAlphaBaseCard(),
      builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_DEPART),
      builder.buildAlphaBaseCard(),
      builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_DEPART)
    ];
    const confirmBtn = PlanetCardDepartTest.createFakeElement('sui-screen-btn sui-mod-disabled');
    const cancelBtn = PlanetCardDepartTest.createFakeElement('sui-screen-btn sui-mod-secondary');
    const elements = {[cards[0].primaryBtnId]: confirmBtn, [cards[0].secondaryBtnId]: cancelBtn};

    PlanetCardDepartTest.withPage(elements, (visited, listeners) => {
      cards.forEach(card => PlanetCardDepartTest.setUpCard(card, elements));
      this.assertEquals(listeners[EVENTS.ENERGY_USAGE_CHANGED].length, 1);

      // Cancel has the id Depart had, and must not be taken for it.
      window.dispatchEvent(new EnergyUsageChangedEvent(PLAYER_TYPES.PLAYER));
      this.assertEquals(cancelBtn.classList.contains('sui-mod-disabled'), false);
      this.assertEquals(confirmBtn.classList.contains('sui-mod-disabled'), true);

      // Another player's energy is none of this card's business.
      keyPlayer.player.capacity = 960;
      window.dispatchEvent(new EnergyUsageChangedEvent(PLAYER_TYPES.RAID_ENEMY));
      this.assertEquals(confirmBtn.classList.contains('sui-mod-disabled'), true);

      builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_LOADING);
      const active = builder.buildAlphaBaseCard(PLANET_CARD_TYPES.ALPHA_BASE_ACTIVE);
      PlanetCardDepartTest.setUpCard(active, elements);
      this.assertEquals(listeners[EVENTS.ENERGY_USAGE_CHANGED].length, 0);
    });
  });

  newPlanetIsRecognisedAfterChangingGuildTest = new DTest('newPlanetIsRecognisedAfterChangingGuildTest', function(params) {
    const {gameState} = PlanetCardDepartTest.given(0, 5160);
    gameState.thisGuild = {id: '0-1'};
    let fetched = null;
    const never = {then: () => {}};
    const listener = new NewPlanetListener(gameState, {
      getPlanet: (id) => { fetched = id; return new Promise(() => {}); },
      getFleetByPlayerId: () => never,
      getStructsByPlayerId: () => never
    }, null);

    listener.handler({
      category: 'player_consensus',
      subject: `structs.player.0-8.${params.id}`,
      id: params.id,
      planet_id: '2-91372'
    });
    this.assertEquals(fetched, params.fetched);
    this.assertEquals(listener.shouldUnregister(), params.fetched !== null);
  }, () => [
    {id: '1-303', fetched: '2-91372'},
    {id: '1-3030', fetched: null}
  ]);
}
