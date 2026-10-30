"""Official-release node fixture for the isolated browser stack.

Run only in the labelled test container on its internal Docker network. All
keys/state belong to this disposable chain; the browser mnemonic is public.
"""
import base64
import json
import os
from pathlib import Path
import subprocess

if os.environ.get('STRUCTS_BROWSER_FIXTURE') != 'isolated':
    raise RuntimeError('This entry point belongs only to the isolated browser fixture')

home = '/fixture/chain'
mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'


def cli(*args, stdin=None):
    result = subprocess.run(['structsd', *args, '--home', home], input=stdin,
                            text=True, capture_output=True, check=True)
    return result.stdout


def raw_address(address):
    alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
    value = 0
    bits = 0
    output = bytearray()
    for char in address.split('1', 1)[1][:-6]:
        value = value << 5 | alphabet.index(char)
        bits += 5
        if bits >= 8:
            bits -= 8
            output.append((value >> bits) & 255)
    return base64.b64encode(output).decode()


genesis = Path(home, 'config/genesis.json')
if not genesis.exists():
    cli('init', 'browser-fixture', '--chain-id', 'structstestnet-111')
    cli('keys', 'add', 'browser', '--recover', '--keyring-backend', 'test', stdin=mnemonic+'\n')
    cli('keys', 'add', 'validator', '--keyring-backend', 'test')
    actor = cli('keys', 'show', 'browser', '-a', '--keyring-backend', 'test').strip()
    validator_account = cli('keys', 'show', 'validator', '-a', '--keyring-backend', 'test').strip()
    validator = cli('keys', 'show', 'validator', '-a', '--bech', 'val', '--keyring-backend', 'test').strip()
    data = json.loads(genesis.read_text())
    data['app_state']['staking']['params']['bond_denom'] = 'ualpha'
    genesis.write_text(json.dumps(data))
    cli('genesis', 'add-genesis-account', validator_account, '1000000000000ualpha')
    cli('genesis', 'add-genesis-account', actor, '1000000000ualpha')
    cli('genesis', 'gentx', 'validator', '1000000000ualpha', '--chain-id', 'structstestnet-111', '--keyring-backend', 'test')
    cli('genesis', 'collect-gentxs')
    data = json.loads(genesis.read_text())
    data['initial_height'] = '3353000'
    state = data['app_state']['structs']
    state.update({
        'playerList': [{'id':'1-1','index':'1','creator':actor,'primaryAddress':actor,
                        'guildId':'0-1','planetId':'2-1','fleetId':'9-1','name':'Browser Fixture'},
                       {'id':'1-2','index':'2','creator':validator_account,'primaryAddress':validator_account,
                        'guildId':'0-1','name':'Recipient'}],
        'playerCount':'2',
        'addressList': [{'address':actor,'playerIndex':'1'}, {'address':validator_account,'playerIndex':'2'}],
        'permissionList': [{'permissionId':'8-'+actor+'@0','value':'33554423'},
                           {'permissionId':'8-'+validator_account+'@0','value':'33554431'}],
        'guildList': [{'id':'0-1','index':'1','creator':actor,'owner':'1-1','name':'Browser Guild',
                       'primaryReactorId':'3-1','entryRank':'1','bankConvertInFee':'0','bankConvertOutFee':'0'}],
        'guildCount':'1',
        'reactorList': [{'id':'3-1','validator':validator,'rawAddress':raw_address(validator),
                         'guildId':'0-1','owner':'1-1','defaultCommission':'0.1'}],
        'reactorCount':'1',
        'planetList': [{'id':'2-1','owner':'1-1','creator':actor,'name':'Fixture Prime','maxOre':'100',
                        'spaceSlots':'2','airSlots':'2','landSlots':'3','waterSlots':'2',
                        'space':['',''],'air':['',''],'land':['','',''],'water':['','']}],
        'planetCount':'1',
        'fleetList': [{'id':'9-1','owner':'1-1','locationType':'planet','locationId':'2-1','status':'onStation',
                       'spaceSlots':'2','airSlots':'2','landSlots':'2','waterSlots':'2',
                       'space':['',''],'air':['',''],'land':['',''],'water':['','']}],
        'vaultOwnerList':['1-1','1-2'],
    })
    genesis.write_text(json.dumps(data))
    config = Path(home, 'config/config.toml')
    config.write_text(config.read_text().replace('timeout_commit = "5s"','timeout_commit = "3s"'))

cli('genesis', 'validate')
state = json.loads(genesis.read_text())['app_state']['structs']
Path('/fixture/public.json').write_text(json.dumps({'actor':state['playerList'][0]['primaryAddress'],
    'recipient':state['playerList'][1]['primaryAddress'], 'validator':state['reactorList'][0]['validator'],
    'chainId':'structstestnet-111'}))

os.execvp('structsd', ['structsd','start','--home',home,'--api.enable',
                      '--api.address','tcp://0.0.0.0:1317','--rpc.laddr','tcp://0.0.0.0:26657',
                      '--minimum-gas-prices','0.025ualpha'])
