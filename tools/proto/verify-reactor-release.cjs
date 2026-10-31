#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const release = '96cea3a322c406b46ca1feb880dc4497ebd9353f';
const source = process.argv[2];
if (!source) throw new Error('Usage: node tools/proto/verify-reactor-release.cjs /path/to/structsd');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-release-reactor-'));
try {
  const archive = execFileSync('git', ['archive', release], {cwd:path.resolve(source),maxBuffer:64*1024*1024});
  execFileSync('tar', ['-xf','-','-C',temporary], {input:archive});
  fs.copyFileSync(path.join(__dirname,'reactor-release_test.go'),path.join(temporary,'app/client_reactor_batch_test.go'));
  fs.copyFileSync(path.join(__dirname,'retained-funding-release_test.go'),path.join(temporary,'app/client_retained_funding_test.go'));
  console.log(`Testing real app/ante/staking against release ${release}; temporary in-memory chains only.`);
  execFileSync('go', ['test','-count=1','-p','1','-run','^TestClient(ReactorBatch|RetainedFunding)','-v','./app'], {cwd:temporary,stdio:'inherit'});
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
