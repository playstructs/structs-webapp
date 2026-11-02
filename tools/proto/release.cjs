// Shared runner for checks against an archive of the pinned structsd release.
// Nothing in the chain checkout is changed; every run uses a temporary copy.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync, spawnSync} = require('node:child_process');

const RELEASE = '96cea3a322c406b46ca1feb880dc4497ebd9353f';

// Client tests copied into the release's app package, and the exact tests each
// verifier must see pass (release tests included).
const SUITES = {
  reactor: {
    description: 'real app/ante/staking',
    files: {'reactor-release_test.go': 'app/client_reactor_batch_test.go',
      'retained-funding-release_test.go': 'app/client_retained_funding_test.go'},
    tests: ['TestClientReactorBatch', 'TestClientReactorBatchUnprovisionedVault', 'TestClientReactorBatchFractionalShares',
      'TestClientRetainedFundingAtomic', 'TestClientRetainedFundingMaturedRefund'],
  },
  generator: {
    description: 'real app/ante/bank',
    files: {'generator-release_test.go': 'app/client_generator_funding_test.go'},
    tests: ['TestClientGeneratorFunding', 'TestClientGeneratorRetainedFunding', 'TestSignedGeneratorVaultBurnAndBatchRollback'],
  },
  gameplay: {
    description: 'native signed simulation',
    files: {'gameplay-release_test.go': 'app/client_gameplay_test.go'},
    tests: ['TestClientGameplaySimulation', 'TestClientExpirySequenceEvidence', 'TestClientSequenceConflict'],
  },
};

/** Extracts the pinned release into a temporary directory, runs `work` there, then removes it. */
function withRelease(source, label, work) {
  if (!source) throw new Error('Supply the path to a structsd checkout containing the pinned release');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), `structs-release-${label}-`));
  try {
    const archive = execFileSync('git', ['archive', RELEASE], {cwd: path.resolve(source), maxBuffer: 64 * 1024 * 1024});
    execFileSync('tar', ['-xf', '-', '-C', temporary], {input: archive});
    return work(temporary);
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

/**
 * Runs exactly the named tests and fails unless each one reported PASS. A name
 * that matches nothing would otherwise let `go test -run` succeed silently.
 */
function goTestExactly(directory, pkg, names) {
  const run = spawnSync('go', ['test', '-count=1', '-p', '1', '-run', `^(${names.join('|')})$`, '-v', pkg],
    {cwd: directory, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (run.error) throw run.error;
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  if (run.status !== 0) throw new Error(`go test failed with status ${run.status}`);
  const missing = names.filter(name => !new RegExp(`^--- PASS: ${name} `, 'm').test(run.stdout));
  if (missing.length) throw new Error(`Expected tests did not run: ${missing.join(', ')}`);
  return run.stdout;
}

function verifySuite(name, source) {
  const suite = SUITES[name];
  withRelease(source, name, temporary => {
    for (const [file, target] of Object.entries(suite.files)) fs.copyFileSync(path.join(__dirname, file), path.join(temporary, target));
    console.log(`Testing ${suite.description} against release ${RELEASE}; temporary in-memory chains only.`);
    goTestExactly(temporary, './app', suite.tests);
  });
}

module.exports = {RELEASE, SUITES, withRelease, goTestExactly, verifySuite};
