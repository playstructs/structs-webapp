import {DTest, DTestSuite} from "../framework/DTestFramework";
import {MapTileSelectionComponent} from "../view_models/components/map/MapTileSelectionComponent";

/**
 * The map builds a new tile selection layer on every render. Each layer used to
 * add six window listeners and never remove them, so every re-render of the
 * player's map or the raid map left another set listening for the session.
 * destroy() must now take back exactly what initPageCode added.
 */
export class MapTileSelectionListenerTest extends DTestSuite {

  constructor() {
    super('MapTileSelectionListenerTest');
  }

  /**
   * Run fn against a window that records listeners, so the shared test window stays clean.
   *
   * @param {function(Map<string, Set<function>>): void} fn
   */
  static withRecordingWindow(fn) {
    const sharedWindow = global.window;
    const sharedDocument = global.document;
    const listeners = new Map();

    global.window = {
      addEventListener: (type, handler) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener: (type, handler) => listeners.get(type)?.delete(handler),
      dispatchEvent: () => true,
    };
    global.document = {getElementById: () => ({querySelectorAll: () => []})};

    try {
      fn(listeners);
    } finally {
      global.window = sharedWindow;
      global.document = sharedDocument;
    }
  }

  /**
   * @param {Map<string, Set<function>>} listeners
   * @return {number}
   */
  static count(listeners) {
    return [...listeners.values()].reduce((total, handlers) => total + handlers.size, 0);
  }

  /**
   * @return {MapTileSelectionComponent}
   */
  static makeLayer() {
    return new MapTileSelectionComponent({}, null, null, [], null, null, null, null, null, 'tile-selection', 'raid-map');
  }

  initPageCodeAddsSixWindowListenersTest = new DTest('initPageCodeAddsSixWindowListenersTest', function() {
    MapTileSelectionListenerTest.withRecordingWindow(listeners => {
      MapTileSelectionListenerTest.makeLayer().initPageCode();
      this.assertEquals(MapTileSelectionListenerTest.count(listeners), 6);
    });
  });

  destroyRemovesEveryWindowListenerTest = new DTest('destroyRemovesEveryWindowListenerTest', function() {
    MapTileSelectionListenerTest.withRecordingWindow(listeners => {
      const layer = MapTileSelectionListenerTest.makeLayer();
      layer.initPageCode();
      layer.destroy();
      this.assertEquals(MapTileSelectionListenerTest.count(listeners), 0);
    });
  });

  repeatedRendersDoNotAccumulateListenersTest = new DTest('repeatedRendersDoNotAccumulateListenersTest', function() {
    MapTileSelectionListenerTest.withRecordingWindow(listeners => {
      // What MapComponent.render() now does: destroy the previous layer, then build and init a new one.
      let layer = null;
      for (let i = 0; i < 5; i++) {
        layer?.destroy();
        layer = MapTileSelectionListenerTest.makeLayer();
        layer.initPageCode();
      }
      this.assertEquals(MapTileSelectionListenerTest.count(listeners), 6);
    });
  });

  destroyTwiceIsSafeTest = new DTest('destroyTwiceIsSafeTest', function() {
    MapTileSelectionListenerTest.withRecordingWindow(listeners => {
      const layer = MapTileSelectionListenerTest.makeLayer();
      layer.initPageCode();
      layer.destroy();
      layer.destroy();
      this.assertEquals(MapTileSelectionListenerTest.count(listeners), 0);
    });
  });
}
