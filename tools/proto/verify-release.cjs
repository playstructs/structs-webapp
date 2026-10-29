#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const release = '96cea3a322c406b46ca1feb880dc4497ebd9353f';
const [source, fixture] = process.argv.slice(2);
if (!source || !fixture) throw new Error('Usage: node tools/proto/verify-release.cjs /path/to/structsd fixture.json');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'structs-release-wire-'));
try {
  const archive = execFileSync('git',['archive',release],{cwd:path.resolve(source),maxBuffer:64*1024*1024});
  execFileSync('tar',['-xf','-','-C',temporary],{input:archive});
  const destination = path.join(temporary,'cmd/client-wire-check');
  fs.mkdirSync(destination);
  fs.copyFileSync(path.join(__dirname,'verify-wire.go'),path.join(destination,'main.go'));
  execFileSync('go',['run','./cmd/client-wire-check',path.resolve(fixture)],{cwd:temporary,stdio:'inherit'});
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
