#!/usr/bin/env node
// Usage: node tools/proto/verify-reactor-release.cjs /path/to/structsd
require('./release.cjs').verifySuite('reactor', process.argv[2]);
