#!/usr/bin/env node
// Capture the checked-in pre-migration encoder once; fixtures remain reviewable.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname,'../..');
const revision = '2d0116c852ee0b9e13ec6deb44ab4beb1b07222e';
const modules = process.env.STRUCTS_NODE_MODULES || path.join(root,'src/node_modules');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'structs-legacy-codecs-'));
try {
  const prefix = 'src/js/ts/structs.structs/types/';
  const names = execFileSync('git',['ls-tree','-r','--name-only',revision,prefix],{cwd:root}).toString().trim().split('\n');
  let sourceHash;
  for (const name of names.filter(name=>name.endsWith('.ts'))) {
    const bytes = execFileSync('git',['show',`${revision}:${name}`],{cwd:root,maxBuffer:8*1024*1024});
    const target = path.join(temporary,name.slice(prefix.length));
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
    if (name.endsWith('/structs/structs/tx.ts')) sourceHash = crypto.createHash('sha256').update(bytes).digest('hex');
  }
  require.extensions['.ts'] = (module, filename) => {
    module.paths.push(modules);
    module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
  };
  const codecs = require(path.join(temporary,'structs/structs/tx.ts'));
  const amount = {denom:'ualpha',amount:'9007199254740993'};
  const cases = [
    ['MsgPlayerSend',{creator:'signer',fromAddress:'source',toAddress:'dest',amount:[amount]}],
    ['MsgAddressRegister',{creator:'signer',playerId:'1-1',address:'device',proofPubKey:'key',proofSignature:'proof',permissions:255}],
    ['MsgReactorInfuse',{creator:'signer',delegatorAddress:'source',validatorAddress:'validator',amount}],
    ['MsgReactorDefuse',{creator:'signer',delegatorAddress:'source',validatorAddress:'validator',amount}],
    ['MsgReactorCancelDefusion',{creator:'signer',delegatorAddress:'source',validatorAddress:'validator',amount,creationHeight:3352999}],
    ['MsgAgreementOpen',{creator:'signer',providerId:'5-1',duration:10,capacity:20}],
    ['MsgGuildCreate',{creator:'signer',reactorId:'3-1',endpoint:'endpoint',entrySubstationId:'4-1',proof:'',nonce:''}],
    ['MsgStructAttack',{creator:'signer',operatingStructId:'5-1',targetStructId:['5-2'],weaponSystem:'primary'}],
  ];
  const fixtures = cases.map(([name,payload])=>({typeUrl:`/structs.structs.${name}`,payload,
    wire:Buffer.from(codecs[name].encode(codecs[name].fromPartial(payload)).finish()).toString('base64')}));
  fs.writeFileSync(path.join(__dirname,'legacy-wire.json'),JSON.stringify({revision,tx_source_sha256:sourceHash,fixtures},null,2)+'\n');
  console.log(`Captured ${fixtures.length} legacy wire fixtures from ${revision}`);
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
