// Real signature validation against the isolated browser node. The published
// fixture mnemonic has no authority outside that disposable chain; no tx is sent.
const assert=require('node:assert/strict');
const req=require('node:module').createRequire(process.env.STRUCTS_NODE_MODULES
  ? require('node:path').join(process.env.STRUCTS_NODE_MODULES,'../package.json')
  : require('node:path').resolve(__dirname,'../../src/package.json'));
const {DirectSecp256k1HdWallet}=req('@cosmjs/proto-signing');
const {Secp256k1,sha256}=req('@cosmjs/crypto');
const base=process.argv[2]||'http://127.0.0.1:57370';
if(new URL(base).hostname!=='127.0.0.1')throw new Error('Only a loopback disposable fixture is supported');
const request=(route,options={})=>fetch(base+route,{...options,signal:AbortSignal.timeout(10000)});
(async()=>{
  const fixture=await(await request('/js/fixture-public.json')).json();
  assert.equal(fixture.isolation,'structs-v022-browser');
  const wallet=await DirectSecp256k1HdWallet.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',{prefix:'structs'});
  const [key]=await wallet.getAccountsWithPrivkeys();assert.equal(key.address,fixture.actor);
  const login=async(route='/api/auth/login',offset=0)=>{
    const time=String(Math.floor(Date.now()/1000)+offset);
    const sig=await Secp256k1.createSignature(sha256(new TextEncoder().encode(`LOGIN_GUILD0-1ADDRESS${key.address}DATETIME${time}`)),key.privkey);
    return request(route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:key.address,pubkey:Buffer.from(key.pubkey).toString('hex'),signature:Buffer.from(sig.toFixedLength()).toString('hex'),guild_id:'0-1',unix_timestamp:time})});
  };
  const session=await login();assert.equal(session.status,200);
  const cookie=session.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
  const protectedRead=headers=>request('/api/player/1-1',{headers});
  assert.equal((await protectedRead({Cookie:cookie})).status,200);
  assert.equal((await protectedRead({Cookie:cookie,Authorization:'Bearer invalid'})).status,401);
  const logout=await request('/api/auth/logout',{method:'POST',headers:{Cookie:cookie}});
  assert.equal(logout.status,200);
  const loggedOut=await logout.json();assert.equal(loggedOut.success,true);
  assert.deepEqual(loggedOut.errors,[],'Logout must finish without a swallowed session error');
  assert.equal((await protectedRead({Cookie:cookie})).status,401,'The exact old cookie must lose access');
  assert.equal((await request('/api/auth/logout',{method:'GET',headers:{Cookie:cookie}})).status,405,'Logout is POST only');
  assert.equal((await request('/api/auth/logout',{method:'POST',headers:{Cookie:cookie}})).status,200);
  for(const route of ['/api/auth/login','/api/auth/token']){
    assert.equal((await login(route,1200)).status,401,'Future-dated signatures cannot extend the login window');
    assert.equal((await login(route,-1200)).status,401);
  }
  const issued=await(await login('/api/auth/token')).json();assert.equal(issued.success,true);
  assert.equal(issued.data.token_type,'Bearer');assert.equal(issued.data.expires_in,86400);
  const authorization='Bearer '+issued.data.access_token;
  assert.equal((await protectedRead({Authorization:authorization})).status,200);
  assert.equal((await request('/api/auth/logout',{method:'POST',headers:{Authorization:authorization}})).status,200);
  assert.equal((await protectedRead({Authorization:authorization})).status,401);
  assert.equal((await request('/api/guild/0-1/power/stats')).status,200,'Approved guild reads remain public');
  console.log('Auth HTTP: real signed session and bearer login; old cookie invalidated; bearer revoked; invalid bearer refuses cookie fallback; bounded timestamps; public guild reads preserved.');
})().catch(error=>{console.error(error);process.exitCode=1;});
