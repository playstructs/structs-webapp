#!/usr/bin/env node
// Decode an exported client wire fixture with the pinned release's own codecs.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {withRelease} = require('./release.cjs');
const [source, fixture] = process.argv.slice(2);
if (!source || !fixture) throw new Error('Usage: node tools/proto/verify-release.cjs /path/to/structsd fixture.json');
withRelease(source, 'wire', temporary => {
  const destination = path.join(temporary, 'cmd/client-wire-check');
  fs.mkdirSync(destination);
  fs.copyFileSync(path.join(__dirname, 'verify-wire.go'), path.join(destination, 'main.go'));
  execFileSync('go', ['run', './cmd/client-wire-check', path.resolve(fixture)], {cwd: temporary, stdio: 'inherit'});
});
