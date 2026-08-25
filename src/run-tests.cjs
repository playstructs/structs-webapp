// Runs the browser test bundle under Node with the little of the DOM the
// suites touch, so they can be exercised without opening a page.
const listeners = {};

global.window = {
  addEventListener: (type, handler) => {
    (listeners[type] = listeners[type] || []).push(handler);
  },
  dispatchEvent: (event) => {
    (listeners[event.type] || []).forEach((handler) => handler(event));
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
  if (/DTestAssertError|is not equal to/.test(line)) {
    failures++;
  }
  log(...args);
};

require('./public/js/test.js');

log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILING ASSERTION(S)'}`);
process.exit(failures === 0 ? 0 : 1);
