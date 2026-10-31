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


metadata = json.loads(docker('inspect', node))[0]
assert metadata['Config']['Labels'].get('structs.task') == 'v022-browser'
assert 'STRUCTS_BROWSER_FIXTURE=isolated' in metadata['Config']['Env']
networks = metadata['NetworkSettings']['Networks']
assert len(networks) == 1 and manifest['network'] in networks
assert json.loads(docker('network', 'inspect', manifest['network']))[0]['Internal']
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
    assert result['code'] == 0, result
    for _ in range(30):
        try:
            committed = cli('query', 'tx', result['txhash'])
        except subprocess.CalledProcessError:
            time.sleep(1)
            continue
        assert committed['code'] == 0, committed
        print(json.dumps({'operation': args[0], 'hash': result['txhash'], 'height': committed['height']}), flush=True)
        return
    raise RuntimeError('Fixture transaction was not confirmed; inspect it before continuing')


actor = public['actor']
vault = cli('query', 'structs', 'vault', '1-1')['address']
assert balance(actor) >= 50_000_000
send('reactor-infuse', public['validator'], '50000000ualpha', '--delegator-address', actor)
for source in [actor, vault]:
    amount = balance(source)
    if amount:
        send('player-send', source, public['recipient'], f'{amount}ualpha')
send('reactor-defuse', public['validator'], '50000000ualpha', '--delegator-address', actor)
assert balance(actor) == 0 and balance(vault) == 0
pending = cli('query', 'staking', 'unbonding-delegation', actor, public['validator'])
print(json.dumps({'status': 'pending', 'actorBalance': '0', 'vaultBalance': '0', 'unbonding': pending}), flush=True)
