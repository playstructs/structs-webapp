#!/usr/bin/env node
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createDisposableDatabase} = require('./DisposableDatabase.cjs');
const root = path.resolve(__dirname, '../..');
let database;
try {
  database = createDisposableDatabase();
  const run = spawnSync('docker', ['run', '--rm', '--network', `container:${database.container}`,
    '-v', `${root}:/workspace:ro`, '--tmpfs', '/workspace/src/var:mode=1777', '-w', '/workspace/src',
    '-e', `INTEGRATION_DATABASE_URL=postgresql://structs@127.0.0.1/${database.name}?sslmode=disable`,
    '--entrypoint', 'php', 'structs-v022-webapp:ae4457e2', 'vendor/bin/phpunit',
    '--do-not-cache-result', '--fail-on-skipped', ...process.argv.slice(2)],
    {stdio: 'inherit', timeout: 300000});
  if (run.error) throw run.error;
  process.exitCode = run.status ?? 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  database?.close();
}
