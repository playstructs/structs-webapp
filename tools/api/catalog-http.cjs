// Authenticated HTTP regression through disposable Apache and the control dev proxy.
// Uses only the named disposable Sqitch database; never the running guild database.
const {execFileSync} = require('node:child_process');
const {createHmac, randomBytes} = require('node:crypto');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const database = 'structs-v022-pg';
const suffix = randomBytes(5).toString('hex');
const network = 'structs-v022-catalog-' + suffix;
const apache = network + '-apache';
const proxy = network + '-proxy';
const secret = randomBytes(32).toString('hex');
const denoms = ['ualpha', 'uguild.0-990970', 'ibc/' + 'A'.repeat(64), 'factory/structs1issuer/token:one'];
const recoveryAddress = 'structs1avgyh77ycn997ja45q5q8ss8y9mr424jymd59f';
const balance = '1000000000000000000000000000000000000000000000000000000000000';
const activityTime = '2026-10-30T12:34:56.123456Z';
const activityDetail = JSON.parse(require('../proto/combat-v022.json').fixtures[4].event.attributes[0].value);
const docker = (args, input) => execFileSync('docker', args, {encoding: 'utf8', input, timeout: 60000, stdio: ['pipe', 'pipe', 'pipe']}).trim();
const sql = query => docker(['exec', '-i', '--user', 'structs', database, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-d', 'structs', '-At'], query);
const port = name => docker(['port', name, '80/tcp']).split(':').pop();
const payload = Buffer.from(JSON.stringify({p: '1-990970', g: '0-990970', exp: Math.floor(Date.now()/1000)+600, jti: randomBytes(12).toString('hex')})).toString('base64url');
const token = payload + '.' + createHmac('sha256', secret).update('guild-bearer.' + payload).digest('base64url');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const request = (base, route, auth = true) => fetch(base + route, {headers: auth ? {Authorization: 'Bearer ' + token} : {}, redirect: 'manual', signal: AbortSignal.timeout(10000)});
async function ready(base) {
    for (let i=0; i<40; i++) {
        try {
            const response = await request(base, '/api/provider/denom/ualpha/page/1', false);
            if (response.status === 401) return;
        } catch (_) {}
        await pause(500);
    }
    throw new Error('HTTP service did not reach the existing authentication boundary: ' + base);
}
(async () => {
    let seeded = false;
    let attached = false;
    try {
        assert.equal(docker(['inspect', '--format', '{{index .Config.Labels \"structs.task\"}}', database]), 'v022-integration');
        sql("BEGIN; INSERT INTO structs.guild(id,name,primary_reactor_id) VALUES ('0-990970','Public guild fixture','3-990970');\n" +
            "INSERT INTO structs.reactor(id,validator,guild_id) VALUES('3-990970','publicguildvalidator','0-990970');\n" +
            "INSERT INTO structs.guild_meta(id,this_infrastructure) VALUES('0-990970',false);\n" +
            "INSERT INTO structs.player(id,guild_id,primary_address) VALUES('1-990970','0-990970','cataloghttpprimary');\n" +
            `INSERT INTO structs.player_address(address,player_id,guild_id,status) VALUES('${recoveryAddress}','1-990970','0-990970','approved');\n` +
            denoms.map((denom, i) => `INSERT INTO structs.provider(id,owner,rate_amount,rate_denom) VALUES('9-${990970+i}','0-990970',1,'${denom}');\n` +
                `INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance) VALUES ('address','cataloghttpfirst','${denom}',${balance}),('address','cataloghttpsecond','${denom}',${balance}-1);`).join('\n') + '\nCOMMIT;');
        seeded = true;
        sql(`INSERT INTO structs.planet_activity(time,planet_id,seq,category,detail,block_height)
            VALUES('${activityTime}','2-990976',0,'struct_attack','${JSON.stringify(activityDetail).replace(/'/g,"''")}'::jsonb,3353001);`);
        docker(['network', 'create', network]);
        docker(['network', 'connect', network, database]);
        attached = true;
        docker(['run', '-d', '--name', apache, '--platform', 'linux/amd64', '--network', network, '--network-alias', 'structs-webapp',
            '-p', '127.0.0.1::80', '-e', 'APP_ENV=prod', '-e', 'APP_DEBUG=0', '-e', 'APP_SECRET=' + secret,
            '-e', 'DATABASE_URL=postgresql://structs_webapp@' + database + ':5432/structs?serverVersion=18',
            '-v', root + '/src:/src:ro', '--tmpfs', '/src/var:rw,mode=1777',
            '-v', root + '/docker/apache/structs.conf:/etc/apache2/sites-available/000-default.conf:ro',
            'structs/structs-webapp:latest']);
        const direct = 'http://127.0.0.1:' + port(apache);
        await ready(direct);
        docker(['run', '-d', '--name', proxy, '--platform', 'linux/amd64', '--network', network,
            '-p', '127.0.0.1::80', '-e', 'STRUCTS_CONTROL_MODE=dev', '-e', 'STRUCTS_DEV_PORT=80',
            '-e', 'STRUCTS_DEV_PROXY_TARGET=http://structs-webapp:80', 'structs/structs-control:latest']);
        const proxied = 'http://127.0.0.1:' + port(proxy);
        await ready(proxied);
        let checks = 0;
        for (const [surface, base] of [['apache', direct], ['control-dev-proxy', proxied]]) {
            const eventPath = `/api/planet-activity/planet/2-990976/event/0?time=${encodeURIComponent(activityTime)}`;
            assert.equal((await request(base,eventPath,false)).status,401,surface+' exact activity remains authenticated');
            const activity = await request(base,eventPath);
            assert.equal(activity.status,200);assert.deepEqual((await activity.json()).data.detail,activityDetail);
            assert.equal((await request(base,'/api/planet-activity/planet/2-990976/event/0')).status,400);
            const missing = await request(base,eventPath.replace('123456','123457'));
            assert.equal(missing.status,200);assert.equal((await missing.json()).data,null);
            checks += 4;
            for (const [route, models] of [['/api/struct/type', []], ['/api/work/player/1-990970', ['work']]]) {
                assert.equal((await request(base, route, false)).status, 401);
                const response = await request(base, route);
                assert.equal(response.status, 200, surface + ' stamped catalog/work read');
                const body = await response.json();
                assert.equal(body.success, true);
                assert.ok(Array.isArray(body.data));
                assert.equal(body.meta.api_contract, 'structs-api-v022-1');
                assert.deepEqual(body.meta.required_models, models);
                assert.match(response.headers.get('cache-control'), /\bno-(cache|store)\b|\bmax-age=0\b/);
                checks += 2;
            }
            for (const route of ['/api/player-address/player/1-990970', '/api/player-address/count/player/1-990970',
                '/api/player-address/cataloghttpprimary']) {
                assert.equal((await request(base, route, false)).status, 401);
                const owned = await request(base, route);
                assert.equal(owned.status, 200, surface + ' own private device read');
                assert.equal(owned.headers.get('cache-control').includes('no-store'), true);
                checks++;
            }
            for (const route of ['/api/player-address/player/1-990971', '/api/player-address/count/player/1-990971']) {
                assert.equal((await request(base, route)).status, 403, surface + ' refuses other player device data');
                checks++;
            }
            for (const [address, expected] of [['cataloghttpprimary', 201], ['cataloghttpother', 403]]) {
                const response = await fetch(base + '/api/player-address/meta', {method:'POST',
                    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
                    body:JSON.stringify({address,guild_id:'0-990970',user_agent:surface}),signal:AbortSignal.timeout(10000)});
                assert.equal(response.status, expected, surface + ' scoped private metadata write');
                checks++;
            }
            const device = await request(base, '/api/player-address/cataloghttpprimary');
            assert.equal((await device.json()).data.user_agent, surface, surface + ' metadata persisted under restricted role');
            checks++;
            // Signup bootstrap reads are deliberately public, including equivalent API paths.
            for (const prefix of surface === 'apache' ? ['/api/', '/api%2F', '/%61pi/'] : ['/api/', '/api%2F']) {
                for (const route of ['guild/this', 'setting', 'timestamp']) {
                    const response = await request(base, prefix + route, false);
                    assert.equal(response.status, 200, surface + ' public bootstrap ' + prefix + route);
                    assert.equal((await response.json()).success, true);
                    checks++;
                }
            }
            // Recovery must resolve the real mapped entity before a browser can sign in.
            for (const [guild,status,expected] of [['0-990970','approved',{player_id:'1-990970'}],
                ['0-990971','approved',null],['0-990970','pending',null]]) {
                sql(`UPDATE structs.player_address SET status='${status}' WHERE address='${recoveryAddress}';`);
                const response = await request(base, `/api/auth/player-address/${recoveryAddress}/guild/${guild}/player-id`, false);
                assert.equal(response.status,200,surface+' public recovery lookup');
                const body=await response.json();assert.equal(body.success,true);assert.deepEqual(body.data,expected);
                checks++;
            }
            sql(`UPDATE structs.player_address SET status='approved' WHERE address='${recoveryAddress}';`);
            const proof = await request(base, '/api/auth/player-address/invalid/player/1-1/proof', false);
            assert.equal(proof.status, 409, surface + ' registration context is public but validates its identity');
            assert.equal((await proof.json()).errors.proof_unavailable, 'Current registration proof is unavailable');
            assert.equal(proof.headers.get('cache-control').includes('no-store'), true);
            const pendingRoute = '/api/player-address/code/ZZZQQ?activation_id=11111111-1111-4111-8111-111111111111';
            assert.equal((await request(base, pendingRoute, false)).status, 401, surface + ' pending devices require authentication');
            const pending = await request(base, pendingRoute);
            assert.equal(pending.status, 200);
            assert.equal((await pending.json()).data, null);
            const registration = await request(base, '/api/auth/player-address/invalid/player/1-1/registration', false);
            assert.equal(registration.status, 400, surface + ' registration association is public but validates its identity');
            assert.equal(registration.headers.get('cache-control').includes('no-store'), true);
            assert.equal((await request(base, '/api/player-address/code/ZZZQQ')).status, 400, 'Issued instance is mandatory');
            assert.equal((await request(base, '/api/player-address/invalid/state', false)).status, 401, 'Device state is authenticated');
            assert.equal((await request(base, '/api/player-address/invalid/state')).status, 400);
            for (const auth of [false,true]) {
                const response = await fetch(base + '/api/player-address/permissions', {method:'PUT',
                    headers: {'Content-Type':'application/json',...(auth ? {Authorization:'Bearer '+token} : {})},
                    body:JSON.stringify({address:'structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a',permissions:'0'}),
                    signal:AbortSignal.timeout(10000)});
                assert.equal(response.status,auth ? 410 : 401,'Permission writes require a chain transaction');
                if (auth) assert.equal((await response.json()).success,false);
            }
            checks += 9;
            const guildRoutes = ['guild/this', 'guild/name', 'guild/count', 'guild/directory', 'guild/0-990970',
                'guild/0-990970/name', 'guild/0-990970/members/count', 'guild/0-990970/power/stats',
                'guild/0-990970/roster', 'guild/0-990970/planet/complete/count'];
            for (const prefix of surface === 'apache' ? ['/api/', '/api%2F', '/%61pi/'] : ['/api/', '/api%2F']) {
                for (const route of guildRoutes) {
                    const response = await fetch(base + prefix + route, {
                        headers: {Origin: 'https://other-guild.example'}, credentials: 'omit',
                        redirect: 'manual', signal: AbortSignal.timeout(10000),
                    });
                    const text = await response.text();
                    assert.equal(response.status, 200, surface + ' public guild read ' + prefix + route + ' ' + text.slice(0, 300));
                    const body = JSON.parse(text);
                    assert.equal(body.success, true);
                    assert.equal(response.headers.get('access-control-allow-origin'), '*');
                    assert.equal(response.headers.get('access-control-allow-credentials'), null);
                    if (route === 'guild/0-990970') assert.equal(body.data.id, '0-990970');
                    if (route === 'guild/0-990970/name') assert.equal(body.data.name, 'Public guild fixture');
                    if (route === 'guild/0-990970/members/count') assert.equal(String(body.data.count), '1');
                    if (route === 'guild/0-990970/roster') assert.equal(body.data[0].id, '1-990970');
                    checks++;
                }
            }
            const head = await fetch(base + '/api/guild/0-990970', {method: 'HEAD', signal: AbortSignal.timeout(10000)});
            assert.equal(head.status, 200);
            assert.equal(head.headers.get('access-control-allow-origin'), '*');
            assert.equal(await head.text(), '');
            checks++;
            const preflight = await fetch(base + '/api/guild/0-990970/roster', {
                method: 'OPTIONS', headers: {Origin: 'https://other-guild.example',
                    'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Content-Type'},
                signal: AbortSignal.timeout(10000),
            });
            assert.equal(preflight.status, 204);
            assert.equal(preflight.headers.get('access-control-allow-origin'), '*');
            assert.equal(preflight.headers.get('access-control-allow-methods'), 'GET, HEAD');
            assert.match(preflight.headers.get('access-control-allow-headers'), /content-type/);
            assert.equal(preflight.headers.get('access-control-allow-credentials'), null);
            assert.equal(await preflight.text(), '');
            checks++;
            for (const [route, method, headers] of [['guild/0-990970', 'POST', 'content-type'],
                ['guild/0-990970', 'GET', 'authorization'], ['player-address/meta', 'POST', 'content-type']]) {
                const response = await fetch(base + '/api/' + route, {
                    method: 'OPTIONS', headers: {Origin: 'https://other-guild.example',
                        'Access-Control-Request-Method': method, 'Access-Control-Request-Headers': headers},
                    signal: AbortSignal.timeout(10000),
                });
                assert.ok(response.status >= 400, surface + ' excludes non-public preflights');
                assert.equal(response.headers.get('access-control-allow-origin'), null);
                checks++;
            }
            for (const prefix of surface === 'apache' ? ['/api/', '/api%2F', '/%61pi/'] : ['/api/', '/api%2F']) {
                const response = await fetch(base + prefix + 'player-address/meta', {
                    method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://other-guild.example'},
                    body: '{}', signal: AbortSignal.timeout(10000),
                });
                assert.equal(response.status, 401, surface + ' device writes stay authenticated');
                assert.equal((await response.json()).errors.authentication_error, 'Login required');
                assert.equal(response.headers.get('access-control-allow-origin'), null);
                checks++;
            }
            for (let i=0; i<denoms.length; i++) {
                const denom = denoms[i];
                for (const resource of ['inventory', 'provider']) {
                    const route = `/api/${resource}/denom/${encodeURIComponent(denom)}/page/1?limit=1`;
                    const unauthorized = await request(base, route, false);
                    assert.equal(unauthorized.status, 401, surface + ' authentication ' + route);
                    assert.equal(unauthorized.headers.get('access-control-allow-origin'), null);
                    const response = await request(base, route);
                    const text = await response.text();
                    assert.equal(response.status, 200, surface + ' ' + route + ' ' + text.slice(0, 300));
                    const body = JSON.parse(text);
                    assert.equal(body.success, true);
                    assert.equal(body.data.length, 1);
                    assert.equal(body.data[0][resource === 'inventory' ? 'denom' : 'rate_denom'], denom);
                    if (resource === 'inventory') {
                        assert.equal(body.data[0].balance, balance);
                        const second = await request(base, `/api/inventory/denom/${encodeURIComponent(denom)}/page/2?limit=1`);
                        assert.equal(second.status, 200);
                        assert.equal((await second.json()).data[0].owner_id, 'cataloghttpsecond');
                    } else {
                        assert.equal(body.data[0].id, '9-' + (990970+i));
                    }
                    checks++;
                }
            }
            // The router/firewall decode once; authentication must use that same path.
            for (const route of surface === 'apache'
                ? ['/api%2Fprovider/denom/ualpha/page/1', '/%61pi/provider/denom/ualpha/page/1']
                : ['/api%2Fprovider/denom/ualpha/page/1']) {
                assert.equal((await request(base, route, false)).status, 401, surface + ' encoded API prefix needs authentication');
                assert.equal((await request(base, route)).status, 200, surface + ' authenticated encoded API prefix');
                checks++;
            }
            if (surface === 'control-dev-proxy') {
                // Its raw /api proxy prefix does not forward an encoded letter.
                // That URL serves the SPA shell, never unauthenticated API data.
                const response = await request(base, '/%61pi/provider/denom/ualpha/page/1', false);
                assert.equal(response.status, 200);
                assert.match(response.headers.get('content-type'), /^text\/html/);
                assert.match(await response.text(), /<!doctype html>/i);
                checks++;
            }
            for (const denom of ['ab', 'abc%252Fdef', 'abc%27def']) {
                const response = await request(base, `/api/provider/denom/${denom}/page/1`);
                assert.equal(response.status, 404, surface + ' rejects invalid or double-encoded denomination');
                checks++;
            }
            console.log(JSON.stringify({surface, status: 'passed', denominations: denoms, checks}));
        }
        console.log(JSON.stringify({status: 'passed', checks, authenticated: true, database, liveStackChanged: false}));
    } catch (error) {
        for (const name of [apache, proxy]) {
            try { console.error(docker(['logs', '--tail', '12', name])); } catch (_) {}
        }
        throw error;
    } finally {
        for (const name of [proxy, apache]) { try { docker(['rm', '-f', name]); } catch (_) {} }
        if (attached) docker(['network', 'disconnect', network, database]);
        try { docker(['network', 'rm', network]); } catch (_) {}
        if (seeded) sql("BEGIN; DELETE FROM structs.player_address_meta WHERE address='cataloghttpprimary';\n" +
            `DELETE FROM structs.planet_activity WHERE time='${activityTime}' AND planet_id='2-990976' AND seq=0;\n` +
            "DELETE FROM structs.player_address WHERE address='cataloghttpprimary';\n" +
            "DELETE FROM structs.api_inventory WHERE owner_type='address' AND owner_id IN ('cataloghttpfirst','cataloghttpsecond');\n" +
            "DELETE FROM structs.provider WHERE id IN ('9-990970','9-990971','9-990972','9-990973');\n" +
            "DELETE FROM structs.player_address WHERE player_id='1-990970'; DELETE FROM structs.player WHERE id='1-990970'; " +
            "DELETE FROM structs.guild_meta WHERE id='0-990970'; DELETE FROM structs.reactor WHERE id='3-990970'; DELETE FROM structs.guild WHERE id='0-990970'; COMMIT;");
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
