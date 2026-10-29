#!/usr/bin/env node
// Inputs and output are pinned here. Never patch the generated codecs by hand.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const RELEASE = '96cea3a322c406b46ca1feb880dc4497ebd9353f';
const REPOSITORY = 'https://github.com/playstructs/structsd.git';
const OPTIONS = ['forceLong=string', 'esModuleInterop=true', 'snakeToCamel=true', 'useExactTypes=true'];
const destination = path.resolve(__dirname, '../../src/js/ts/structs.structs');
const argv = process.argv.slice(2);
const check = argv.includes('--check');
const sourceIndex = argv.indexOf('--source');
const suppliedSource = sourceIndex < 0 ? null : argv[sourceIndex + 1];
if (argv.some((arg, i) => arg !== '--check' && arg !== '--source' && !(sourceIndex >= 0 && i === sourceIndex + 1))
    || (sourceIndex >= 0 && !suppliedSource)) {
  throw new Error('Usage: node tools/proto/generate.cjs [--source /path/to/structsd] [--check]');
}
for (const [name, version] of Object.entries(require('./package.json').dependencies)) {
  if (require(`${name}/package.json`).version !== version) throw new Error(`Install pinned tools with npm ci --prefix tools/proto: ${name}`);
}
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-proto-'));
const run = (command, args, cwd = temporary) => execFileSync(command, args, {cwd, maxBuffer: 32 * 1024 * 1024});
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (name, bytes) => { fs.mkdirSync(path.dirname(name), {recursive:true}); fs.writeFileSync(name, bytes); };
function files(directory, prefix = '') {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const name = prefix + entry.name;
    return entry.isDirectory() ? files(path.join(directory, entry.name), name + '/') : [name];
  }).sort();
}
try {
  let source = suppliedSource && path.resolve(suppliedSource);
  if (!source) {
    source = path.join(temporary, 'chain');
    fs.mkdirSync(source);
    run('git', ['init', '--quiet'], source);
    run('git', ['fetch', '--quiet', '--depth=1', REPOSITORY, RELEASE], source);
  }
  if (run('git', ['rev-parse', `${RELEASE}^{commit}`], source).toString().trim() !== RELEASE) throw new Error('Release commit mismatch');
  const inputs = {};
  const inputNames = run('git', ['ls-tree', '-r', '--name-only', RELEASE, 'proto'], source).toString().trim().split('\n');
  for (const name of inputNames) {
    const content = run('git', ['show', `${RELEASE}:${name}`], source);
    inputs[name] = digest(content);
    write(path.join(temporary, name), content);
  }
  const buf = path.join(__dirname, 'node_modules/.bin/buf');
  const plugin = path.join(__dirname, 'node_modules/.bin/protoc-gen-ts_proto');
  run(buf, ['build', 'proto', '--exclude-source-info', '-o', 'image.json']);
  const descriptor = JSON.parse(fs.readFileSync(path.join(temporary, 'image.json'), 'utf8'));
  const template = {version:'v1', plugins:[{plugin:'ts_proto', path:plugin, out:'output/types', strategy:'all', opt:OPTIONS}]};
  write(path.join(temporary, 'generate.json'), JSON.stringify(template));
  run(buf, ['generate', 'image.json', '--template', 'generate.json', '--include-imports']);
  const output = path.join(temporary, 'output');
  const imports = [], registrations = [], schemas = {}, allMessages = new Map(), requests = [];
  function walk(messages, packageName, file, parents = []) {
    for (const message of messages ?? []) {
      const names = [...parents, message.name];
      const typeName = `.${packageName}.${names.join('.')}`;
      allMessages.set(typeName, message);
      if (packageName.startsWith('structs.structs') && !message.options?.mapEntry) {
        const name = names.join('_');
        imports.push(`import { ${name} } from "./types/${file.replace(/\.proto$/, '')}";`);
        registrations.push(`  ["/${typeName.slice(1)}", ${name}],`);
      }
      walk(message.nestedType, packageName, file, names);
    }
  }
  for (const file of descriptor.file) {
    walk(file.messageType, file.package, file.name);
    if (file.package === 'structs.structs') {
      for (const service of file.service ?? []) {
        if (service.name === 'Msg') requests.push(...service.method.map(method => method.inputType));
      }
    }
  }
  function addSchema(typeName) {
    const key = '/' + typeName.slice(1);
    if (schemas[key]) return;
    const message = allMessages.get(typeName);
    if (!message) throw new Error(`Missing descriptor for ${typeName}`);
    const fields = schemas[key] = {};
    for (const field of message.field ?? []) {
      const type = field.type.replace('TYPE_', '').toLowerCase();
      fields[field.jsonName] = {type, ...(field.label === 'LABEL_REPEATED' ? {repeated:true} : {}),
        ...(field.options?.['[gogoproto.customtype]'] === 'cosmossdk.io/math.LegacyDec' ? {legacyDecimal:true} : {}),
        ...(type === 'message' ? {message:'/' + field.typeName.slice(1)} : {})};
      if (type === 'message') addSchema(field.typeName);
    }
  }
  requests.sort().forEach(addSchema);
  write(path.join(output, 'registry.ts'), '// Generated by tools/proto/generate.cjs. DO NOT EDIT.\n'
    + 'import { GeneratedType } from "@cosmjs/proto-signing";\n' + imports.sort().join('\n')
    + '\n\nexport const msgTypes: Array<[string, GeneratedType]> = [\n' + registrations.sort().join('\n') + '\n];\n');
  write(path.join(output, 'message-schemas.json'), JSON.stringify(Object.fromEntries(Object.entries(schemas).sort()), null, 2) + '\n');
  const manifest = {release:'v0.22.0', commit:RELEASE, repository:REPOSITORY,
    tools:require('./package.json').dependencies, strategy:'all', options:OPTIONS, inputs,
    generated:Object.fromEntries(files(output).map(name => [name, digest(fs.readFileSync(path.join(output,name)))]))};
  write(path.join(output, 'generation.json'), JSON.stringify(manifest, null, 2) + '\n');
  if (check) {
    const existing = files(destination);
    const generated = files(output);
    const changed = [...new Set([...existing, ...generated])].filter(name =>
      !existing.includes(name) || !generated.includes(name)
      || !fs.readFileSync(path.join(destination, name)).equals(fs.readFileSync(path.join(output, name))));
    if (changed.length) throw new Error(`Generated output differs:\n${changed.join('\n')}`);
    console.log(`Verified ${generated.length} generated files at ${RELEASE}`);
  } else {
    // Generation and descriptor validation finish before replacing checked-in output.
    fs.rmSync(destination, {recursive:true,force:true});
    fs.cpSync(output, destination, {recursive:true});
    console.log(`Generated ${files(output).length} files at ${RELEASE}`);
  }
} finally {
  fs.rmSync(temporary, {recursive:true,force:true});
}
