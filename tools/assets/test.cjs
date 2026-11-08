// Exercise the production output/manifest configuration with a real worker.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const modules = process.env.STRUCTS_NODE_MODULES || path.join(root, 'src/node_modules');
const webpack = require(path.join(modules, 'webpack'));
const base = require(path.join(root, 'src/webpack.config.js'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-assets-'));
const output = path.join(temporary, 'js');
const worker = path.join(temporary, 'worker.js');
fs.writeFileSync(path.join(temporary, 'index.js'), 'new Worker(new URL("./worker.js", import.meta.url));');
const config = {...base, mode: 'production', context: temporary,
  entry: {index: './index.js'}, output: {...base.output, path: output},
  resolve: {...base.resolve, modules: [modules, 'node_modules']},
  resolveLoader: {modules: [modules, 'node_modules']},
};
function build() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);
    compiler.run((error, stats) => {
      compiler.close(closeError => {
        if (error || closeError || stats.hasErrors()) reject(error || closeError || new Error(stats.toString()));
        else resolve(stats.compilation.getAssets().map(asset => asset.name));
      });
    });
  });
}
function snapshot(assets) {
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  const entry = manifest['js/index.js'];
  assert.match(entry, /^js\/index\.[a-f0-9]+\.js$/);
  const chunks = assets.filter(name => name.endsWith('.js'));
  assert.equal(chunks.length, 2);
  const worker = chunks.find(name => name !== entry.slice(3));
  assert.match(worker, /\.[a-f0-9]+\.js$/);
  assert.equal(fs.existsSync(path.join(output, 'index.js')), false, 'No unversioned application fallback');
  return {entry, worker, bytes: fs.readFileSync(path.join(temporary, entry)),
    workerBytes: fs.readFileSync(path.join(output, worker))};
}
async function main() {
  fs.writeFileSync(worker, 'self.postMessage("first-worker");');
  const first = snapshot(await build());
  const repeat = snapshot(await build());
  assert.equal(first.entry, repeat.entry);
  assert.equal(first.worker, repeat.worker);
  fs.writeFileSync(worker, 'self.postMessage("changed-worker");');
  const changed = snapshot(await build());
  assert.notEqual(changed.worker, first.worker, 'Worker changes get a new URL');
  assert.notEqual(changed.entry, first.entry, 'Parent bundle pins its changed worker');
  assert.deepEqual(fs.readFileSync(path.join(temporary, first.entry)), first.bytes, 'Existing tabs retain their original parent');
  assert.deepEqual(fs.readFileSync(path.join(output, first.worker)), first.workerBytes, 'Existing tabs retain their matching worker');
  console.log('Real builds: stable content keeps URLs; worker changes version both worker and parent; prior assets stay intact.');
}
main().catch(error => {console.error(error); process.exitCode = 1;})
  .finally(() => fs.rmSync(temporary, {recursive: true, force: true}));
