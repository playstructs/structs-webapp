// Runs the browser test bundle under Node with the little of the DOM the
// suites touch, so they can be exercised without opening a page.
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
    // Copied so a handler that unregisters itself does not shift the list
    // out from under the walk.
    (listeners[event.type] || []).slice().forEach((handler) => handler(event));
    return true;
  },
  // js-sha256 otherwise takes its Node path and reaches for a Buffer the
  // browser bundle doesn't carry.
  JS_SHA256_NO_NODE_JS: true,
};

global.CustomEvent = class CustomEvent {
  constructor(type) {
    this.type = type;
  }
};

let failures = 0;
const log = console.log;
console.log = (...args) => {
  const line = args.join(' ');
  // A test that throws rather than asserting is still a failing test, and
  // DTest reports it the same way, so any error reaching the log counts.
  if (/DTestAssertError|is not equal to|Error:/.test(line)) {
    failures++;
  }
  log(...args);
};

const fs = require('node:fs');
const path = require('node:path');
const assetDirectory = process.env.STRUCTS_TEST_ASSET_DIR || path.join(__dirname, 'public/js');
const manifest = JSON.parse(fs.readFileSync(path.join(assetDirectory, 'manifest.json'), 'utf8'));
const testBundle = manifest['js/test.js'];
if (!/^js\/test\.[a-f0-9]+\.js$/.test(testBundle || '')) throw new Error('Build the test assets before running the suite');
const bundlePath = path.join(assetDirectory, testBundle.slice(3));
// Webpack resolves its worker chunks relative to the executing script.
const bundleUrl = require('node:url').pathToFileURL(bundlePath).href;
global.document = {baseURI: bundleUrl, currentScript: {tagName: 'SCRIPT', src: bundleUrl}};
global.self = global.window;
require(bundlePath);

log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILING ASSERTION(S)'}`);
process.exit(failures === 0 ? 0 : 1);
