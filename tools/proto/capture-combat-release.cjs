#!/usr/bin/env node
// Usage: node tools/proto/capture-combat-release.cjs /path/to/structsd output.json [--check]
// With --check, regenerate in memory and fail unless output.json matches byte for byte.
const fs = require('node:fs');
const path = require('node:path');
const {RELEASE, withRelease, goTestExactly} = require('./release.cjs');
const args = process.argv.slice(2), check = args.includes('--check');
const [source, output] = args.filter(arg => arg !== '--check');
if (!source || !output) throw new Error('Usage: node tools/proto/capture-combat-release.cjs /path/to/structsd output.json [--check]');
const captured = withRelease(source, 'combat', temporary => {
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
  const log = goTestExactly(temporary, './x/structs/keeper', ['TestMsgStructAttackEventRecordsObservedTargetHealth']);
  const fixtures = log.split('\n').filter(line => line.startsWith('STRUCTS_COMBAT_FIXTURE '))
    .map(line => JSON.parse(line.slice('STRUCTS_COMBAT_FIXTURE '.length)));
  if (fixtures.length !== 14) throw new Error(`Expected all 14 release scenarios, received ${fixtures.length}`);
  return JSON.stringify({release: RELEASE, source: 'x/structs/keeper/attack_event_health_test.go', fixtures}, null, 2) + '\n';
});
if (check) {
  if (fs.readFileSync(path.resolve(output), 'utf8') !== captured) throw new Error(`${output} differs from the release capture`);
  console.log(`${output} matches the ${RELEASE} release capture.`);
} else {
  fs.writeFileSync(path.resolve(output), captured);
  console.log(`Captured 14 successful release-handler scenarios from ${RELEASE}; temporary keeper chains only.`);
}
