#!/usr/bin/env node
// Usage: node tools/proto/verify-generator-release.cjs /path/to/structsd
require('./release.cjs').verifySuite('generator', process.argv[2]);
