const {randomBytes} = require('node:crypto');
const {execFileSync} = require('node:child_process');

// The source fixture container; it must carry the structs.task=v022-integration label.
const FIXTURE_CONTAINER = process.env.STRUCTS_INTEGRATION_PG || 'structs-v022-pg';
exports.FIXTURE_CONTAINER = FIXTURE_CONTAINER;

/** Logical snapshot of the labelled fixture, with no shared-row mutations. */
exports.createDisposableDatabase = function () {
  const container = FIXTURE_CONTAINER;
  const database = `webapp_test_${randomBytes(8).toString('hex')}`;
  const dump = `/tmp/${database}.dump`;
  const restoreList = `/tmp/${database}.list`;
  const execute = args => execFileSync('docker', ['exec', '-u', 'postgres', container, ...args], {stdio:'pipe'});
  const sql = (command, target = 'postgres') => execute([
    'psql', '-X', '-At', '-h', '/var/run/postgresql', '-U', 'postgres', '-d', target,
    '-v', 'ON_ERROR_STOP=1', '-c', command]);

  let created = false;
  const close = () => {
    if (created) { sql(`DROP DATABASE ${database} WITH (FORCE)`); created = false; }
    execute(['rm', '-f', dump, restoreList]);
  };
  try {
    const label = execFileSync('docker', ['inspect', '--format', '{{index .Config.Labels "structs.task"}}', container], {encoding:'utf8'}).trim();
    if (label !== 'v022-integration') throw new Error('Refusing an unlabelled database fixture');
    // A logical snapshot leaves the fixture's background workers and other
    // readers alone. Cron jobs belong to the source database, not the test clone.
    execute(['pg_dump', '-h', '/var/run/postgresql', '-U', 'postgres', '-d', 'structs',
      '-Fc', '--exclude-extension=pg_cron', '-f', dump]);
    sql(`CREATE DATABASE ${database} TEMPLATE template0`);
    created = true;
    // Sqitch installs Timescale in structs, not public. Match that namespace so
    // restored aggregates resolve the same extension functions.
    sql('CREATE SCHEMA structs AUTHORIZATION structs', database);
    sql('CREATE EXTENSION timescaledb WITH SCHEMA structs', database);
    sql('SELECT structs.timescaledb_pre_restore()', database);
    const entries = execute(['pg_restore', '--list', dump]).toString().split('\n');
    if (entries.filter(line => / SCHEMA - structs /.test(line)).length !== 1) {
      throw new Error('Unexpected fixture schema layout');
    }
    const list = entries.filter(line => !/ SCHEMA - structs /.test(line)).join('\n');
    execFileSync('docker', ['exec', '-i', '-u', 'postgres', container, 'tee', restoreList], {input:list,stdio:['pipe','ignore','pipe']});
    execute(['pg_restore', '-h', '/var/run/postgresql', '-U', 'postgres', '-d', database,
      '--exit-on-error', '--use-list', restoreList, dump]);
    sql('SELECT structs.alter_job(job_id, scheduled => false) FROM timescaledb_information.jobs', database);
    sql('SELECT structs.timescaledb_post_restore()', database);
    sql(`ALTER DATABASE ${database} SET structs.test_fixture = 'disposable-v022'`);
    return {container, name:database, sql:command => sql(command, database).toString().trim(), close};
  } catch (error) {
    close();
    throw error;
  }
};
