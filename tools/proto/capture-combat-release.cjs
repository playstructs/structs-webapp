#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const release = '96cea3a322c406b46ca1feb880dc4497ebd9353f';
const source = process.argv[2], output = process.argv[3];
if (!source || !output) throw new Error('Usage: node tools/proto/capture-combat-release.cjs /path/to/structsd output.json');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'structs-release-combat-'));
try {
  const archive = execFileSync('git', ['archive', release], {cwd: path.resolve(source), maxBuffer: 64 * 1024 * 1024});
  execFileSync('tar', ['-xf', '-', '-C', temporary], {input: archive});
  const testPath = path.join(temporary, 'x/structs/keeper/attack_event_health_test.go');
  let test = fs.readFileSync(testPath, 'utf8');
  const marker = 'detail := attacks[0].EventAttackDetail';
  if (test.split(marker).length !== 2) throw new Error('Release capture point changed');
  test = test.replace('import (', 'import (\n"encoding/json"\n"fmt"');
  test = test.replace(marker, `${marker}
            wire, wireErr := sdk.TypedEventToEvent(attacks[0])
            require.NoError(t, wireErr)
            captured, captureErr := json.Marshal(struct {Name string \x60json:"name"\x60; Event sdk.Event \x60json:"event"\x60}{t.Name(), wire})
            require.NoError(t, captureErr)
            fmt.Printf("STRUCTS_COMBAT_FIXTURE %s\\n", captured)
  `);
  fs.writeFileSync(testPath, test);
  const log = execFileSync('go', ['test', '-count=1', '-p', '1', '-run', '^TestMsgStructAttackEventRecordsObservedTargetHealth$', '-v', './x/structs/keeper'],
    {cwd: temporary, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  const fixtures = log.split('\n').filter(line => line.startsWith('STRUCTS_COMBAT_FIXTURE '))
    .map(line => JSON.parse(line.slice('STRUCTS_COMBAT_FIXTURE '.length)));
  if (fixtures.length !== 14) throw new Error(`Expected all 14 release scenarios, received ${fixtures.length}`);
  fs.writeFileSync(path.resolve(output), JSON.stringify({release, source: 'x/structs/keeper/attack_event_health_test.go', fixtures}, null, 2) + '\n');
  console.log(`Captured ${fixtures.length} successful release-handler scenarios from ${release}; temporary keeper chains only.`);
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
