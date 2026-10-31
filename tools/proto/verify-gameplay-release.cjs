#!/usr/bin/env node
// Usage: node tools/proto/verify-gameplay-release.cjs /path/to/structsd
require('./release.cjs').verifySuite('gameplay', process.argv[2]);
