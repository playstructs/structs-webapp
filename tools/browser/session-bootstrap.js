import {GameState} from '../../src/js/models/GameState';

// Public fixture key on the isolated node, never a live player's session.
if(location.hostname!=='127.0.0.1')throw new Error('Fixture session requires localhost');
const response=await fetch('/js/fixture-public.json',{cache:'no-store'});
const fixture=await response.json();
if(fixture.isolation!=='structs-v022-browser')throw new Error('Wrong fixture origin');
const state=new GameState();
state.mnemonic='abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const wallet=await state.walletManager.createWallet(state.mnemonic);
const [account]=await wallet.getAccountsWithPrivkeys();
if(account.address!==fixture.actor)throw new Error('Fixture key does not match the isolated node');
state.pubkey=state.walletManager.bytesToHex(account.pubkey);
state.keyPlayers.player.id='1-1';
state.currentBlockHeight=3353000;
state.save();
localStorage.setItem('currentMenuPage',JSON.stringify({controller:'Account',page:'index',options:{}}));
localStorage.setItem('lastMenuPage',JSON.stringify({controller:'Account',page:'index',options:{}}));
location.replace('/');
