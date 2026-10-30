#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const release = '96cea3a322c406b46ca1feb880dc4497ebd9353f';
const source = process.argv[2];
if (!source) throw new Error('Usage: node tools/proto/verify-gameplay-release.cjs /path/to/structsd');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-release-gameplay-'));
try {
  const archive = execFileSync('git', ['archive', release], {cwd:path.resolve(source),maxBuffer:64*1024*1024});
  execFileSync('tar', ['-xf','-','-C',temporary], {input:archive});
  fs.copyFileSync(path.join(__dirname,'gameplay-release_test.go'),path.join(temporary,'app/client_gameplay_test.go'));
  console.log(`Testing native signed simulation against release ${release}; temporary in-memory chains only.`);
  execFileSync('go', ['test','-count=1','-p','1','-run','^TestClientGameplaySimulation$','-v','./app'], {cwd:temporary,stdio:'inherit'});
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
