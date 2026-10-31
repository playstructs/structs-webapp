// Build isolated benchmarks from the production worker; no wallet or RPC is used.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '../..');
const modules = process.env.STRUCTS_NODE_MODULES || path.join(root, 'src/node_modules');
const webpack = require(path.join(modules, 'webpack'));
const output = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(output)) throw new Error('Supply the isolated preview JS directory');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-worker-benchmark-'));
let source = fs.readFileSync(path.join(root, 'src/js/workers/TaskWorker.js'), 'utf8');
source = source.replace(/from "\.\.\//g, `from "${root}/src/js/`);
source = source.replace('let sessionIterations = 0;', 'let sessionIterations = 0; let benchmarkStart;');
source = source.replace('function work() {', 'function work() { benchmarkStart ??= performance.now();');
source = source.replace('state.iterations_since_last_start = ++sessionIterations;', `state.iterations_since_last_start = ++sessionIterations;
        if (sessionIterations === 524288) {
            postMessage({benchmark: {iterations: sessionIterations, elapsedMs: performance.now() - benchmarkStart}});
            return;
        }`);
const channel = source;
const timer = source.replace('let scheduled = false;\nconst batchChannel = new MessageChannel();\nbatchChannel.port1.onmessage = work;', 'let timer = null;')
  .replace(/if \(!scheduled && !state.isCompleted\(\)\) \{[\s\S]*?batchChannel.port2.postMessage\(null\);\n    \}/,
    'if (timer === null && !state.isCompleted()) timer = setTimeout(work, 0);')
  .replace('scheduled = false;\n    const difficulty', 'timer = null;\n    const difficulty');
if (timer.includes('batchChannel') || timer === channel) throw new Error('Worker scheduler changed; review the benchmark adapter');
fs.writeFileSync(path.join(temporary, 'timer.js'), timer);
fs.writeFileSync(path.join(temporary, 'channel.js'), channel);
const entry = Object.fromEntries(['timer', 'channel'].map(name => [name, path.join(temporary, name + '.js')]));
webpack({mode:'production',target:'webworker',entry,output:{path:output,filename:'review-worker-[name].js'},
  resolve:{modules:[modules,'node_modules']}}, (error, stats) => {
  try {
    if (error || stats.hasErrors()) throw error || new Error(stats.toString({all:false,errors:true}));
    fs.copyFileSync(path.join(__dirname, 'worker-benchmark.html'), path.join(output, 'worker-benchmark.html'));
    console.log('Built timer/MessageChannel benchmark with identical hashes and 4096-hash batches.');
  } catch (failure) { console.error(failure); process.exitCode = 1; }
  finally { fs.rmSync(temporary, {recursive:true,force:true}); }
});
