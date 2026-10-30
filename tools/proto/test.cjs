#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const modules = process.env.STRUCTS_NODE_MODULES || path.join(root,'src/node_modules');
const webpack = require(path.join(modules,'webpack'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-wire-tests-'));
const options = {noEmit:true,strict:true,skipLibCheck:true,target:ts.ScriptTarget.ES2020,
  module:ts.ModuleKind.CommonJS,moduleResolution:ts.ModuleResolutionKind.Node10,
  esModuleInterop:true,resolveJsonModule:true,typeRoots:[path.join(modules,'@types')],types:['node']};
const host = ts.createCompilerHost(options);
host.resolveModuleNames = (names, containingFile) => names.map(name =>
  ts.resolveModuleName(name,containingFile,options,host).resolvedModule
  ?? ts.resolveModuleName(name,path.join(modules,'../__type_resolution__.ts'),options,host).resolvedModule);
const program = ts.createProgram([path.join(__dirname,'typecheck.ts'),path.join(root,'src/js/ts/structs.structs/registry.ts')], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {getCanonicalFileName:x=>x,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));
  process.exitCode = 1;
  fs.rmSync(temporary,{recursive:true,force:true});
} else {
  console.log('Generated bindings and targeted wire types passed TypeScript checking.');
  const config = {mode:'development',target:'node',devtool:false,context:root,
    entry:{wire:path.join(__dirname,'wire.test.js'),query:path.join(__dirname,'query.test.js'),submission:path.join(__dirname,'submission.test.js'),ledger:path.join(__dirname,'ledger.test.js'),transfer:path.join(__dirname,'transfer.test.js'),transferFlow:path.join(__dirname,'transfer-flow.test.js'),reactor:path.join(__dirname,'reactor.test.js'),reactorFlow:path.join(__dirname,'reactor-flow.test.js'),alphaRefresh:path.join(__dirname,'alpha-refresh.test.js'),generator:path.join(__dirname,'generator.test.js')},
    output:{path:temporary,filename:'[name].cjs'},
    resolve:{extensions:['.js','.ts','.json'],modules:[modules,'node_modules']},
    module:{rules:[{test:/\.ts$/,loader:path.join(modules,'ts-loader'),options:{transpileOnly:true,
      compiler:path.join(__dirname,'node_modules/typescript'),configFile:path.join(root,'src/tsconfig.json')}}]}};
  config.entry.deviceChange = path.join(__dirname,'device-change.test.js');
  config.entry.registration = path.join(__dirname,'registration.test.js');
  config.entry.generatorFlow = path.join(__dirname,'generator-flow.test.js');
  config.entry.session = path.join(__dirname,'session.test.js');
  config.entry.work = path.join(__dirname,'work.test.js');
  const workerConfig = {mode:'production',target:'webworker',devtool:false,context:root,
    entry:path.join(root,'src/js/workers/TaskWorker.js'),
    output:{path:temporary,filename:'task-worker.js'},
    resolve:{extensions:['.js'],modules:[modules,'node_modules']}};
  webpack([config,workerConfig], (error, stats) => {
    try {
      if (error || stats.hasErrors()) throw error || new Error(stats.toString({all:false,errors:true}));
      for (const name of ['wire','query','submission','ledger','transfer','transferFlow','reactor','reactorFlow','alphaRefresh','generator','generatorFlow','registration','deviceChange','work','session']) {
        const run = spawnSync(process.execPath,[path.join(temporary,`${name}.cjs`)], {cwd:root,stdio:'inherit',
          env:{...process.env,STRUCTS_WORKER_TEST_BUNDLE:path.join(temporary,'task-worker.js')},timeout:60000});
        if (run.error) console.error(run.error);
        if (run.status !== 0) { process.exitCode = run.status ?? 1; break; }
      }
    } catch (failure) {
      console.error(failure); process.exitCode = 1;
    } finally {
      fs.rmSync(temporary,{recursive:true,force:true});
    }
  });
}
