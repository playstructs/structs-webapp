import {GameState} from '../../src/js/models/GameState';

// Public fixture key on the isolated node, never a live player's session.
if (location.hostname !== '127.0.0.1') {
  throw new Error('Fixture session requires localhost');
}
const response = await fetch('/js/fixture-public.json', {cache: 'no-store'});
const fixture = await response.json();
if (fixture.isolation !== 'structs-v022-browser') {
  throw new Error('Wrong fixture origin');
}
const owner2 = new URLSearchParams(location.search).get('identity') === 'owner2';
const playerId = owner2 ? '1-2' : '1-1';
const state = new GameState();
state.mnemonic = owner2
  ? 'legal winner thank year wave sausage worth useful legal winner thank yellow'
  : 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const wallet = await state.walletManager.createWallet(state.mnemonic);
const [account] = await wallet.getAccountsWithPrivkeys();
if (!owner2 && account.address !== fixture.actor) {
  throw new Error('Fixture key does not match the isolated node');
}
const associationResponse = await fetch(
  `/api/auth/player-address/${account.address}/guild/0-1/player-id`,
  {cache: 'no-store'}
);
const association = await associationResponse.json();
if (!association.success || association.data?.player_id !== playerId) {
  throw new Error('Fixture player association is unavailable');
}
state.pubkey = state.walletManager.bytesToHex(account.pubkey);
state.keyPlayers.player.id = playerId;
state.currentBlockHeight = 3353000;
state.save();
const menuPage = JSON.stringify({controller: 'Account', page: 'index', options: {}});
localStorage.setItem('currentMenuPage', menuPage);
localStorage.setItem('lastMenuPage', menuPage);
location.replace('/');
