import {DTest, DTestSuite} from "../framework/DTestFramework";
import {DeployOffcanvas} from "../view_models/components/offcanvas/DeployOffcanvas";
import {MenuPage} from "../framework/MenuPage";
import {ChargeLevelChangedEvent} from "../events/ChargeLevelChangedEvent";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {EVENTS} from "../constants/Events";

/**
 * Covers struct types in the deploy menu becoming selectable while it is open.
 *
 * Which struct types can be deployed used to be decided only when the menu was
 * drawn, so a struct type blocked on battery stayed disabled even after the
 * battery charged enough to build it, until the menu was closed and reopened.
 */
export class DeployOffcanvasChargeTest extends DTestSuite {

  constructor() {
    super('DeployOffcanvasChargeTest');
  }

  /**
   * Runs a test against its own window listeners, so listeners other suites left
   * on the shared window (e.g. action bars) don't react to the charge events here.
   *
   * @param {function} test
   */
  static withOwnWindowListeners(test) {
    const sharedWindow = global.window;
    const listeners = {};

    global.window = {
      addEventListener: (type, handler) => {
        (listeners[type] = listeners[type] || []).push(handler);
      },
      removeEventListener: (type, handler) => {
        const registered = listeners[type] || [];
        const index = registered.indexOf(handler);
        if (index !== -1) {
          registered.splice(index, 1);
        }
      },
      dispatchEvent: (event) => {
        (listeners[event.type] || []).slice().forEach((handler) => handler(event));
        return true;
      }
    };

    try {
      test(listeners);
    } finally {
      global.window = sharedWindow;
    }
  }

  /**
   * @return {object}
   */
  static createFakeElement() {
    const classes = new Set();
    const listeners = {};

    return {
      dataset: {},
      listeners: listeners,
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle: (name, force) => force ? classes.add(name) : classes.delete(name)
      },
      addEventListener: (type, handler) => {
        (listeners[type] = listeners[type] || []).push(handler);
      }
    };
  }

  /**
   * Stands in for the offcanvas the way it looks while the menu is open.
   *
   * @return {{offcanvasElm: object, elements: Object<string, object>}}
   */
  static givenOffcanvasIsOpen() {
    const elements = {};
    const offcanvasElm = DeployOffcanvasChargeTest.createFakeElement();
    offcanvasElm.shownListElm = null;
    offcanvasElm.contains = (elm) => elm !== null && elm === offcanvasElm.shownListElm;

    MenuPage.sui.offcanvas.offcanvasElm = offcanvasElm;

    global.document = {
      getElementById: (id) => elements[id] ?? null,
      removeEventListener: () => {}
    };

    return {offcanvasElm: offcanvasElm, elements: elements};
  }

  /**
   * Opens a deploy menu with one struct type, blocked until the battery allows it.
   *
   * @param {object} offcanvasElm
   * @param {Object<string, object>} elements
   * @param {{blocker: string}} chargeState
   * @return {DeployOffcanvas}
   */
  static whenDeployMenuIsOpened(offcanvasElm, elements, chargeState) {
    const structType = {type: 'Starfighter', category: 'fleet', is_command: false, build_charge: 5};
    const gameState = {
      keyPlayers: {[PLAYER_TYPES.PLAYER]: {id: '1-1'}},
      structTypes: {fetchAllByTileTypeAndAmbit: () => [structType]}
    };
    const structManager = {getDeploymentBlocker: () => chargeState.blocker};

    const deployOffcanvas = new DeployOffcanvas(gameState, null, structManager, 'fleet', 'space', 1);

    // What render() draws, without the struct art
    const linkElm = DeployOffcanvasChargeTest.createFakeElement();
    if (chargeState.blocker) {
      linkElm.classList.add(deployOffcanvas.disabledClassName);
    }
    linkElm.dataset.contextualMsg = chargeState.blocker;
    elements[deployOffcanvas.createLinkId(structType)] = linkElm;

    deployOffcanvas.listElm = {};
    offcanvasElm.shownListElm = deployOffcanvas.listElm;
    deployOffcanvas.initPageCode();

    return deployOffcanvas;
  }

  /**
   * @param {DeployOffcanvas} deployOffcanvas
   * @param {Object<string, object>} elements
   * @return {object}
   */
  static getLinkElm(deployOffcanvas, elements) {
    return elements[deployOffcanvas.createLinkId(deployOffcanvas.deployableStructTypes[0])];
  }

  structTypeBecomesSelectableWhenBatteryChargesTest = new DTest('structTypeBecomesSelectableWhenBatteryChargesTest', function() {
    DeployOffcanvasChargeTest.withOwnWindowListeners(() => {
      const {offcanvasElm, elements} = DeployOffcanvasChargeTest.givenOffcanvasIsOpen();
      const chargeState = {blocker: 'Insufficient battery'};
      const deployOffcanvas = DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const linkElm = DeployOffcanvasChargeTest.getLinkElm(deployOffcanvas, elements);

      this.assertEquals(linkElm.listeners.mouseup === undefined, true);

      chargeState.blocker = '';
      window.dispatchEvent(new ChargeLevelChangedEvent('1-1', 3));

      this.assertEquals(linkElm.classList.contains(deployOffcanvas.disabledClassName), false);
      this.assertEquals(linkElm.dataset.contextualMsg, '');
      this.assertEquals(linkElm.listeners.mouseup.length, 1);
    });
  });

  // Charging again once already selectable should not deploy twice per click.
  repeatedChargeAttachesOneDeployHandlerTest = new DTest('repeatedChargeAttachesOneDeployHandlerTest', function() {
    DeployOffcanvasChargeTest.withOwnWindowListeners(() => {
      const {offcanvasElm, elements} = DeployOffcanvasChargeTest.givenOffcanvasIsOpen();
      const chargeState = {blocker: 'Insufficient battery'};
      const deployOffcanvas = DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const linkElm = DeployOffcanvasChargeTest.getLinkElm(deployOffcanvas, elements);

      chargeState.blocker = '';
      window.dispatchEvent(new ChargeLevelChangedEvent('1-1', 3));
      window.dispatchEvent(new ChargeLevelChangedEvent('1-1', 4));

      this.assertEquals(linkElm.listeners.mouseup.length, 1);
    });
  });

  anotherPlayersChargeLeavesTheMenuAloneTest = new DTest('anotherPlayersChargeLeavesTheMenuAloneTest', function() {
    DeployOffcanvasChargeTest.withOwnWindowListeners(() => {
      const {offcanvasElm, elements} = DeployOffcanvasChargeTest.givenOffcanvasIsOpen();
      const chargeState = {blocker: 'Insufficient battery'};
      const deployOffcanvas = DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const linkElm = DeployOffcanvasChargeTest.getLinkElm(deployOffcanvas, elements);

      chargeState.blocker = '';
      window.dispatchEvent(new ChargeLevelChangedEvent('2-9', 3));

      this.assertEquals(linkElm.classList.contains(deployOffcanvas.disabledClassName), true);
    });
  });

  closedMenuIsNotUpdatedTest = new DTest('closedMenuIsNotUpdatedTest', function() {
    DeployOffcanvasChargeTest.withOwnWindowListeners((listeners) => {
      const {offcanvasElm, elements} = DeployOffcanvasChargeTest.givenOffcanvasIsOpen();
      const chargeState = {blocker: 'Insufficient battery'};
      const deployOffcanvas = DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const linkElm = DeployOffcanvasChargeTest.getLinkElm(deployOffcanvas, elements);

      offcanvasElm.classList.add('hidden');
      chargeState.blocker = '';
      window.dispatchEvent(new ChargeLevelChangedEvent('1-1', 3));

      this.assertEquals(linkElm.listeners.mouseup === undefined, true);
      this.assertEquals(listeners[EVENTS.CHARGE_LEVEL_CHANGED].length, 0);
    });
  });

  // Reopening the same menu draws links with the same IDs; only the new menu should handle them.
  reopenedMenuIsOnlyHandledByTheNewMenuTest = new DTest('reopenedMenuIsOnlyHandledByTheNewMenuTest', function() {
    DeployOffcanvasChargeTest.withOwnWindowListeners(() => {
      const {offcanvasElm, elements} = DeployOffcanvasChargeTest.givenOffcanvasIsOpen();
      const chargeState = {blocker: 'Insufficient battery'};
      DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const reopened = DeployOffcanvasChargeTest.whenDeployMenuIsOpened(offcanvasElm, elements, chargeState);
      const linkElm = DeployOffcanvasChargeTest.getLinkElm(reopened, elements);

      chargeState.blocker = '';
      window.dispatchEvent(new ChargeLevelChangedEvent('1-1', 3));

      this.assertEquals(linkElm.listeners.mouseup.length, 1);
    });
  });
}
