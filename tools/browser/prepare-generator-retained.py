"""Prepare 2 vault + 5 retained Alpha for the existing disposable generator.

Only the labelled, isolated real-stack fixture is accepted. The signing key is
the public BIP39 test vector already registered to fixture player 1-2.
"""
import json
from pathlib import Path
import subprocess
import sys
import time

manifest = json.loads(Path(sys.argv[1]).read_text())
node = manifest['node']


def docker(*args, input=None):
    return subprocess.check_output(['docker', *args], input=input, text=True,
                                   stderr=subprocess.PIPE, timeout=60)


metadata = json.loads(docker('inspect', node))[0]
assert metadata['Config']['Labels'].get('structs.task') == 'v022-browser'
assert 'STRUCTS_BROWSER_FIXTURE=isolated' in metadata['Config']['Env']
assert list(metadata['NetworkSettings']['Networks']) == [manifest['network']]
assert json.loads(docker('network', 'inspect', manifest['network']))[0]['Internal']
public = json.loads(docker('exec', node, 'cat', '/fixture/public.json'))


def cli(*args):
    arguments = list(args)
    options = ['--home', '/fixture/chain', '--output', 'json']
    if args[0] != 'keys':
        options += ['--node', 'http://localhost:26657']
    boundary = arguments.index('--') if '--' in arguments else len(arguments)
    arguments[boundary:boundary] = options
    return json.loads(docker('exec', node, 'structsd', *arguments))


actor = 'structs1avgyh77ycn997ja45q5q8ss8y9mr424jymd59f'
owner = cli('query', 'structs', 'address', actor)
assert owner['playerId'] == '1-2' and owner['permissions'] == '33554431'
generator = cli('query', 'structs', 'struct', '5-2')
assert generator['Struct']['owner'] == '1-2' and generator['structAttributes']['isOnline']
vault = cli('query', 'structs', 'vault', '1-2')['address']
sink = cli('query', 'structs', 'vault', '1-1')['address']
keys = cli('keys', 'list', '--keyring-backend', 'test')
key = next((item['name'] for item in keys if item['address'] == actor), None)
if key is None:
    key = 'review-generator'
    mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
    added = json.loads(docker('exec', '-i', node, 'structsd', 'keys', 'add', key,
        '--recover', '--keyring-backend', 'test', '--home', '/fixture/chain', '--output', 'json', input=mnemonic + '\n'))
    assert added['address'] == actor


def balance(address):
    coins = cli('query', 'bank', 'balances', address)['balances']
    return int(next((coin['amount'] for coin in coins if coin['denom'] == 'ualpha'), '0'))


def send(source, destination, amount):
    if amount == 0:
        return
    result = cli('tx', 'structs', 'player-send', '--from', key, '--keyring-backend', 'test',
                 '--chain-id', public['chainId'], '--fees', '0ualpha', '--gas', 'auto',
                 '--gas-adjustment', '1.5', '--yes', '--', source, destination, f'{amount}ualpha')
    assert result['code'] == 0, result
    print(json.dumps({'acceptedSetupHash': result['txhash']}), flush=True)
    for _ in range(30):
        try:
            committed = cli('query', 'tx', result['txhash'])
        except subprocess.CalledProcessError:
            time.sleep(1)
            continue
        assert committed['code'] == 0, committed
        print(json.dumps({'setupHash': result['txhash'], 'height': committed['height']}), flush=True)
        return
    raise RuntimeError('Setup outcome unknown; inspect the saved hash before continuing')


retained = balance(actor)
if retained < 5_000_000:
    send(vault, actor, 5_000_000 - retained)
else:
    send(actor, sink, retained - 5_000_000)
remaining = balance(vault)
assert remaining >= 2_000_000
send(vault, sink, remaining - 2_000_000)
assert balance(actor) == 5_000_000 and balance(vault) == 2_000_000
print(json.dumps({'status': 'prepared', 'actor': actor, 'vault': vault,
                  'retainedUalpha': '5000000', 'vaultUalpha': '2000000', 'generatorBefore': generator}), flush=True)
