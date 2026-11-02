"""Prepare a real retained refund on the named isolated browser fixture only.

All funds and the public browser key belong to this disposable chain. Leave zero
liquid Alpha and fifty unbonding Alpha so the unchanged browser can observe native
maturity and spend the refund. Never run against the guild/testnet deployment.
"""
import json
from pathlib import Path
import subprocess
import sys
import time

manifest = json.loads(Path(sys.argv[1]).read_text())
node = manifest['node']


def docker(*args):
    return subprocess.check_output(['docker', *args], text=True, stderr=subprocess.PIPE)


def require(condition, message):
    # Explicit checks, not assert: python -O must not skip the isolation guards.
    if not condition:
        raise RuntimeError(message)


metadata = json.loads(docker('inspect', node))[0]
require(metadata['Config']['Labels'].get('structs.task') == 'v022-browser', 'Refusing a container outside the disposable browser fixture')
require('STRUCTS_BROWSER_FIXTURE=isolated' in metadata['Config']['Env'], 'The node is not marked as an isolated browser fixture')
networks = metadata['NetworkSettings']['Networks']
require(len(networks) == 1 and manifest['network'] in networks, 'The node must only join the fixture network')
require(json.loads(docker('network', 'inspect', manifest['network']))[0]['Internal'], 'The fixture network must be internal')
public = json.loads(docker('exec', node, 'cat', '/fixture/public.json'))


def cli(*args):
    return json.loads(docker('exec', node, 'structsd', *args,
                            '--home', '/fixture/chain', '--node', 'http://localhost:26657', '--output', 'json'))


def balance(address):
    result = cli('query', 'bank', 'balances', address)
    return int(next((c['amount'] for c in result['balances'] if c['denom'] == 'ualpha'), '0'))


def send(*args):
    result = cli('tx', 'structs', *args, '--from', 'browser', '--keyring-backend', 'test',
                 '--chain-id', public['chainId'], '--fees', '0ualpha', '--gas', '20000000', '--yes')
    require(result['code'] == 0, f'Fixture transaction failed: {result}')
    for _ in range(30):
        try:
            committed = cli('query', 'tx', result['txhash'])
        except subprocess.CalledProcessError:
            time.sleep(1)
            continue
        require(committed['code'] == 0, f'Fixture transaction failed: {committed}')
        print(json.dumps({'operation': args[0], 'hash': result['txhash'], 'height': committed['height']}), flush=True)
        return
    raise RuntimeError('Fixture transaction was not confirmed; inspect it before continuing')


actor = public['actor']
vault = cli('query', 'structs', 'vault', '1-1')['address']
require(balance(actor) >= 50_000_000, 'The fixture actor holds less than 50 Alpha')
send('reactor-infuse', public['validator'], '50000000ualpha', '--delegator-address', actor)
for source in [actor, vault]:
    amount = balance(source)
    if amount:
        send('player-send', source, public['recipient'], f'{amount}ualpha')
send('reactor-defuse', public['validator'], '50000000ualpha', '--delegator-address', actor)
require(balance(actor) == 0 and balance(vault) == 0, 'Liquid Alpha was not emptied')
pending = cli('query', 'staking', 'unbonding-delegation', actor, public['validator'])
print(json.dumps({'status': 'pending', 'actorBalance': '0', 'vaultBalance': '0', 'unbonding': pending}), flush=True)
