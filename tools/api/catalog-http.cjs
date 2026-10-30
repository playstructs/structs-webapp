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
const balance = '1000000000000000000000000000000000000000000000000000000000000';
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
        sql('BEGIN; INSERT INTO structs.guild(id) VALUES (\'0-990970\');\n' +
            "INSERT INTO structs.player(id,guild_id,primary_address) VALUES('1-990970','0-990970','cataloghttpprimary');\n" +
            denoms.map((denom, i) => `INSERT INTO structs.provider(id,owner,rate_amount,rate_denom) VALUES('9-${990970+i}','0-990970',1,'${denom}');\n` +
                `INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance) VALUES ('address','cataloghttpfirst','${denom}',${balance}),('address','cataloghttpsecond','${denom}',${balance}-1);`).join('\n') + '\nCOMMIT;');
        seeded = true;
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
            for (let i=0; i<denoms.length; i++) {
                const denom = denoms[i];
                for (const resource of ['inventory', 'provider']) {
                    const route = `/api/${resource}/denom/${encodeURIComponent(denom)}/page/1?limit=1`;
                    const unauthorized = await request(base, route, false);
                    assert.equal(unauthorized.status, 401, surface + ' authentication ' + route);
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
        if (seeded) sql("BEGIN; DELETE FROM structs.api_inventory WHERE owner_type='address' AND owner_id IN ('cataloghttpfirst','cataloghttpsecond');\n" +
            "DELETE FROM structs.provider WHERE id IN ('9-990970','9-990971','9-990972','9-990973');\n" +
            "DELETE FROM structs.player_address WHERE player_id='1-990970'; DELETE FROM structs.player WHERE id='1-990970'; DELETE FROM structs.guild WHERE id='0-990970'; COMMIT;");
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
