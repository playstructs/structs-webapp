"""Seed the empty browser fixture from its own node, before starting its writer.

This is test setup, not an indexer snapshot import. The fixture starts at the
testnet activation height, where EventAllGenesis deliberately does not run.
"""
import json
from pathlib import Path
import re
import subprocess
import sys


def run(args, stdin=None):
    result = subprocess.run(args, input=stdin, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout


manifest = json.loads(Path(sys.argv[1]).read_text())
node, database = manifest['node'], manifest['database']
for container in (node, database):
    info = json.loads(run(['docker', 'inspect', container]))[0]
    if info['Config']['Labels'].get('structs.task') != 'v022-browser':
        raise RuntimeError('Refusing a container outside the disposable browser fixture')
network = json.loads(run(['docker', 'network', 'inspect', manifest['network']]))[0]
if not network['Internal']:
    raise RuntimeError('The fixture network must be internal')


def sql(statement):
    return run(['docker', 'exec', '-i', '-u', 'postgres', database, 'psql',
                '-U', 'postgres', '-h', '/var/run/postgresql', '-d', 'structs',
                '-At', '-v', 'ON_ERROR_STOP=1'], statement)


def query(*args):
    return json.loads(run(['docker', 'exec', node, 'structsd', 'query', *args, '-o', 'json']))


if sql('SELECT count(*) FROM structs.player').strip() != '0':
    raise RuntimeError('Seed only an empty fixture database')
if sql('SELECT count(*) FROM sync_state.sync_cursor').strip() != '0':
    raise RuntimeError('Seed before starting the indexer')

columns = json.loads(sql("""SELECT json_object_agg(table_name,columns) FROM (
    SELECT table_name,json_agg(column_name) columns FROM information_schema.columns
    WHERE table_schema='structs' AND is_generated='NEVER' GROUP BY table_name) t"""))
statements = ['BEGIN;']


def literal(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (dict, list)):
        value = json.dumps(value)
    return "'" + str(value).replace("'", "''") + "'"


def insert(table, row, conflict=''):
    row = {key: value for key, value in row.items() if key in columns[table]}
    names = ','.join('"' + key + '"' for key in row)
    values = ','.join(literal(value) for value in row.values())
    statements.append(f'INSERT INTO structs.{table} ({names}) VALUES ({values}) {conflict};')


snapshot = {}
for table, key, command in [
    ('guild', 'Guild', 'guild-all'), ('player', 'Player', 'player-all'),
    ('reactor', 'Reactor', 'reactor-all'), ('planet', 'Planet', 'planet-all'),
    ('fleet', 'Fleet', 'fleet-all'), ('struct_type', 'StructType', 'struct-type-all'),
]:
    result = query('structs', command)
    if result.get('pagination', {}).get('next_key'):
        raise RuntimeError('Unexpected pagination in the small browser fixture')
    snapshot[table] = result[key]
    for record in result[key]:
        row = {re.sub('[A-Z]', lambda match: '_' + match[0].lower(), k): v for k, v in record.items()}
        if table == 'player':
            row['username'] = row.pop('name', '')
        if table in ('planet', 'fleet'):
            row['map'] = {k: record.get(k, []) for k in ('space', 'air', 'land', 'water')}
        if table == 'struct_type':
            for field in ('build_draw', 'passive_draw', 'generating_rate'):
                row[field + '_p'] = row.pop(field, '0')
            row['is_command'] = record.get('class') == 'Command Ship'
        insert(table, row)

# protojson omits zero values; the production handler's typed payload supplies
# those defaults. Supply the same primitive defaults for this fixture catalog.
assignments = sql("""SELECT string_agg(format('%I=COALESCE(%I,%s)',column_name,column_name,
    CASE WHEN data_type='boolean' THEN 'false'
         WHEN data_type IN ('numeric','integer','bigint') THEN '0'
         ELSE quote_literal('') END),',') FROM information_schema.columns
    WHERE table_schema='structs' AND table_name='struct_type' AND is_generated='NEVER'
      AND column_name<>'id' AND data_type IN ('boolean','numeric','integer','bigint','character varying')""").strip()
statements.append('UPDATE structs.struct_type SET ' + assignments + ';')
addresses = query('structs', 'address-all')['address']
for record in addresses:
    insert('player_address', {'address': record['address'], 'player_id': record['playerId'],
           'guild_id': '0-1', 'status': 'approved'},
           'ON CONFLICT (address) DO UPDATE SET player_id=EXCLUDED.player_id,guild_id=EXCLUDED.guild_id,status=EXCLUDED.status')
types = ['guild', 'player', 'planet', 'reactor', 'substation', 'struct', 'allocation',
         'infusion', 'address', 'fleet', 'provider', 'agreement']
for record in query('structs', 'permission-all')['permissionRecords']:
    obj, player = record['permissionId'].split('@')
    kind, index = obj.split('-', 1)
    if kind == '8':
        player = next(item['playerId'] for item in addresses if item['address'] == index)
        obj = player
    insert('permission', {'id': record['permissionId'], 'object_type': types[int(kind)],
           'object_index': index, 'object_id': obj, 'player_id': player, 'val': record.get('value', '0')})
attributes = ['ore', 'fuel', 'capacity', 'load', 'structsLoad', 'power', 'connectionCapacity',
              'connectionCount', 'allocationPointerStart', 'allocationPointerEnd', 'proxyNonce',
              'lastAction', 'nonce', 'ready', 'checkpointBlock']
for record in query('structs', 'grid-all')['gridRecords']:
    attribute, kind, index = record['attributeId'].split('-')
    insert('grid', {'id': record['attributeId'], 'attribute_type': attributes[int(attribute)],
           'object_type': types[int(kind)], 'object_index': index, 'object_id': kind + '-' + index,
           'val': record.get('value', '0')}, 'ON CONFLICT (id) DO UPDATE SET val=EXCLUDED.val')
for owner in ('0-1', '1-1', '1-2'):
    record = query('structs', 'vault', owner)
    if record.get('provisioned'):
        account = query('auth', 'account', record['address'])['account']['value']
        insert('vault', {'owner_id': owner, 'address': record['address'],
               'account_number': account['account_number'], 'account_created': True})
insert('guild_meta', {'id': '0-1', 'name': 'Browser Guild', 'tag': 'TEST', 'this_infrastructure': True})
statements.append('COMMIT;')
directory = Path(manifest['privateFixtureDirectory'])
directory.joinpath('baseline-source.json').write_text(json.dumps(snapshot, indent=2))
directory.joinpath('baseline.sql').write_text('\n'.join(statements))
sql('\n'.join(statements))
print('Seeded the isolated browser fixture; start the real writer at height 3353000 next')
