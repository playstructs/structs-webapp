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

require('./public/js/test.js');

log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILING ASSERTION(S)'}`);
process.exit(failures === 0 ? 0 : 1);
