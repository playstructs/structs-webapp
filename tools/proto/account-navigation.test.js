import assert from 'node:assert/strict';
import {MenuPage} from '../../src/js/framework/MenuPage';
import {MenuPageRouter} from '../../src/js/framework/MenuPageRouter';
import {GuildAPI} from '../../src/js/api/GuildAPI';
import {AccountTransactionViewModel} from '../../src/js/view_models/account/AccountTransactionViewModel';
import {AccountTransactionHistory} from '../../src/js/view_models/account/AccountTransactionHistory';
import {AccountRecipientSearchViewModel} from '../../src/js/view_models/account/AccountRecipientSearchViewModel';
import {AccountRecipientSearchResults} from '../../src/js/view_models/account/AccountRecipientSearchResults';
import {AccountIndexViewModel} from '../../src/js/view_models/account/AccountIndexViewModel';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve=yes; reject=no; });
  return {promise, resolve, reject};
};
const transaction = {id:'9007199254740994',action:'sent',amount:'1',time:'2026-10-30T21:00:00Z',counterparty:'recipient'};
const cases = [
  {View:AccountTransactionViewModel,method:'getTransaction',args:[transaction.id,1],value:transaction,header:'Transaction Details'},
  {View:AccountTransactionHistory,method:'getTransactions',args:[1],value:[],header:'Transaction History'},
  {View:AccountRecipientSearchViewModel,method:'getGuildFilterList',args:[],value:[],header:'Find Recipient'},
  {View:AccountRecipientSearchResults,method:'transferSearch',args:[{search_string:'Recipient'}],value:[],header:'Search Results'},
  {View:AccountIndexViewModel,method:'getPlayerAddressCount',args:[{}],value:2,header:'Account'},
];

async function main() {
  globalThis.localStorage={setItem(){}};
  globalThis.document={getElementById:()=>({addEventListener(){}})};
  let headers=[];
  MenuPage.enablePageTemplate=()=>{};
  MenuPage.setPageTemplateHeaderBtn=header=>headers.push(header);
  MenuPage.setPageTemplateContent=()=>{};
  MenuPage.hideAndClearDialoguePanel=()=>{};
  for (const test of cases) {
    for (const departure of ['none','navigation','logout','player','rejection']) {
      headers=[];
      const pending=deferred(), counts=deferred();
      const state={signingAccount:{address:'actor'},keyPlayers:{player:{id:'1-1',getTag:()=>'',getUsername:()=>''}}};
      const router=new MenuPageRouter();
      router.registerController({name:'Account',index(){},other(){}});
      MenuPage.router=router;router.goto('Account','index');
      const signal=router.navigationSignal;
      let countCalls=0, initialized=0;
      const api={
        [test.method](...args) {
          assert.equal(args.at(-1).signal,signal);
          assert.equal(args.at(-1).timeoutMs,15000);
          return pending.promise;
        },
        countTransactions(id,options) {
          assert.equal(id,'1-1');assert.equal(options.signal,signal);
          countCalls++;return counts.promise;
        },
      };
      const view=new test.View(state,api,...test.args);
      view.initPageCode=()=>initialized++;
      if(view.genericResourceComponent)view.genericResourceComponent.renderHTML=()=>'';
      const rendering=view.render();
      if(departure==='navigation')router.goto('Account','other');
      if(departure==='logout')state.signingAccount=null;
      if(departure==='player')state.keyPlayers.player.id='1-2';
      if(departure==='rejection') {
        router.goto('Account','other');pending.reject(new Error('cancelled read'));
      } else pending.resolve(test.value);
      counts.resolve(0);
      await rendering;
      assert.deepEqual(headers,departure==='none'?[test.header]:[],`${test.View.name}: ${departure}`);
      assert.equal(initialized,departure==='none'?1:0);
      if(test.method==='getTransactions')assert.equal(countCalls,departure==='none'?1:0);
    }
  }
  // Leaving while the second history read is pending is also a departure.
  headers=[];
  const count=deferred();
  const state={signingAccount:{address:'actor'},keyPlayers:{player:{id:'1-1'}}};
  const history=new AccountTransactionHistory(state,{getTransactions:async()=>[],countTransactions:()=>count.promise},1);
  const rendering=history.render();
  await Promise.resolve();MenuPage.router.goto('Account','other');count.resolve(0);await rendering;
  assert.deepEqual(headers,[]);

  // Cancellation reaches the real API transport, including scalar/count reads.
  const options={signal:new AbortController().signal,timeoutMs:15000};
  let requests=0;
  const api=Object.assign(Object.create(GuildAPI.prototype),{
    apiUrl:'/api',ajax:{get:async(url,received)=>{assert.equal(received,options);requests++;return {data:{count:2},meta:{}};}},
    guildAPIResponseFactory:{make:x=>x},handleResponseFailure(){},
    transactionFactory:{make:()=>({...transaction}),parseList:()=>[]},guildFactory:{parseList:()=>[]},
    playerSearchResultDTOFactory:{parseList:()=>[]},getCachedItem:()=>null,cacheItem(){},
  });
  await api.getTransaction(transaction.id,options);
  await api.getTransactions('1-1',1,options);
  await api.countTransactions('1-1',options);
  await api.getPlayerAddressCount('1-1',false,options);
  await api.getGuildFilterList(options);
  await api.transferSearch({search_string:'Recipient'},options);
  assert.equal(requests,6);

  // An hour-old cached count must not survive a completed remote revoke or
  // an external device change whose notification never reached this browser.
  let cachedCount=4, currentCount=3, countReads=0, content='';
  const countAPI=Object.assign(Object.create(GuildAPI.prototype),{
    apiUrl:'/api',getCachedItem:()=>cachedCount,cacheItem:(key,value)=>{cachedCount=value;},
    getSingleDataValue:async()=>{countReads++;return currentCount;},
  });
  const accountState={signingAccount:{address:'actor'},keyPlayers:{player:{id:'1-1',getTag:()=>'',getUsername:()=>''}}};
  MenuPage.setPageTemplateContent=value=>{content=value;};
  MenuPage.router.goto('Account','index');
  const accountView=new AccountIndexViewModel(accountState,countAPI,{});
  accountView.initPageCode=()=>{};
  await accountView.render();
  assert.match(content,/3 Devices Active/);assert.equal(countReads,1);
  currentCount=2;
  await accountView.render();
  assert.match(content,/2 Devices Active/);assert.equal(countReads,2);
  console.log('Account navigation: five real view renders reject late navigation/session responses; history second-read departure and API cancellation pass.');
  console.log('Account device counts refresh after local/external changes without relying on notification delivery.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
