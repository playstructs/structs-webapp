# Native browser screen acceptance

This development fixture loads the actual application shell, styles, view models,
router, queue, offline signer and browser storage. API and native outcomes are
controlled. It makes no RPC connection or chain broadcast, and uses a public
test mnemonic. It is excluded from production webpack entries. It is intended
for a dedicated disposable localhost origin, never the user's served webapp.

Build into the temporary JS directory already mounted by a disposable Apache:

```sh
STRUCTS_NODE_MODULES=/path/to/node_modules NODE_PATH=/path/to/node_modules \
  node tools/browser/build.cjs /temporary/preview/js http://127.0.0.1:PORT
```

Open the returned URL and exercise the real controls. `case` names an isolated
scenario: changing it clears only this dedicated origin's fixture state;
reloading the same case preserves its signed journal and queue. `screen=confirm`
starts at the existing confirmation for one Alpha to player 1-2.

Edit `acceptance-control.json` in the temporary directory to control responses:
`fundsReady`, `prepareFailure`, `outcome` (`success`, `reject`, `unknown`) and
`indexReady`. `transactionDelayMs` delays the details read to test navigation
while a response is pending. The fixture deliberately finishes that response
even after cancellation, checking the view's guard as well as request aborts.
No fixture controls are added to product screens. Console records
prefixed `[acceptance-state]` expose counters and original queue IDs; signed
message identity is recorded as `[acceptance-signing]`.

Check fresh/blocked spendability, selected player versus explicit address,
definitive rejection with the original amount/recipient, uncertain send across
reload, delayed indexing without notifications, and departure before completion.
Save screenshots and console evidence. These browser checks supplement the
authenticated Apache/proxy tests and real release-app/native simulation tests;
they do not prove the live deployment or end-to-end wallet authentication.

The real-stack build also emits `legacy-history.html`. On the disposable origin,
its button saves a synthetic version-2 in-flight backup without signed identity,
refusing to overwrite an existing backup. Return to the normal game and submit
a new explicit action, then revisit the page: the legacy record must remain
`unknown` in the `historical` journal phase, with no signed bytes. The native
player name must not become `ShouldNeverReplay`. This fixture never reads wallet
material and is not a production entry point.

For an uncertain send, reload the same case and press the transfer control
again. The queue must retain its original ID with `signed=1` and `sends=1`.
Switching `outcome` to `success` lets that same transaction reconcile. This
checks duplicate prevention; the forced confirmation entry does not exercise
the normal application's menu/session restoration.

## Isolated real-stack acceptance

`build-stack.cjs` builds the normal application entry, substituting only its
RPC and NATS constructors. It also builds `session-bootstrap.js`, which saves
the public fixture identity on a dedicated localhost origin before normal
startup signs the real API login request. The PHP authentication code, native
queries, signing queue, broadcasts, database and GRASS bridge remain real.
The optional SigningClientManager endpoint leaves production defaults intact.

Use a disposable Docker network created with `--internal`. Run `chain.py` in
the official-release structsd image with `STRUCTS_BROWSER_FIXTURE=isolated`,
a private temporary directory mounted at `/fixture`, and network alias
`structsd`. It creates a single-validator chain with no testnet peers and a
public browser key. The test player deliberately lacks Delete permission so
local-only logout can be exercised. All state and keys belong to this fixture.
Fresh fixture genesis uses a two-minute staking unbonding period so the real SDK
completion path can be observed during browser acceptance. Existing fixture
genesis is never rewritten; create a fresh private directory to test this case.
Production/testnet staking parameters and the release difficulty rules are unchanged.

Create a separate PG container, deploy the full Sqitch plan with the paired
ledger/signer contracts, and use a non-superuser `structs_webapp` role. Before
starting the writer, run `seed-stack.py MANIFEST.json`. The manifest names the
`node`, `database`, internal `network` and `privateFixtureDirectory`; both
containers must carry `structs.task=v022-browser`. Seeding refuses a populated
database. It reads the fixture node's initial entities/catalog and stores its
source snapshot and SQL in the private directory. This establishes test data;
it does not test genesis indexing or production snapshot recovery.

Run the packaged `sync-state init-genesis`, then `ingest -start 3353000`, with
both RPC primary and seed pointing at the isolated node and LCD at
`http://structsd:1317`. Run a separate NATS and the actual structs-grass bridge.
No production database or key volume belongs on this network. Keep the node,
database and NATS unexposed. Only the disposable Apache frontend also joins a
host-accessible network and publishes HTTP on `127.0.0.1`.

Use dedicated temporary database credentials for the frontend and GRASS, with
authenticated `pg_hba.conf` entries scoped to this internal network. GRASS needs
its own non-superuser login and CONNECT on the fixture database for LISTEN; it
does not need a superuser or table-write grant. A fresh image may not already
contain that login. Supply a writable disposable Symfony cache with
`--tmpfs /src/var:rw,mode=1777` when mounting the application source read-only.

Build into a temporary directory outside the checkout:

```sh
STRUCTS_NODE_MODULES=/path/to/node_modules NODE_PATH=/path/to/node_modules \
  node tools/browser/build-stack.cjs /temporary/fixture/js
```

Mount that JS directory over the disposable frontend's `/src/public/js`; copy
the existing `main.js`, `plugins.js` and `vendor/` into it. Apache needs proxy,
proxy_http and proxy_wstunnel enabled, with `/fixture/rpc/` forwarding to
`http://structsd:26657/` (WebSocket upgrade enabled) and `/fixture/nats` to
`ws://fixture-nats:1443/`. Serve `public.json` from the node as
`/js/fixture-public.json`, adding `isolation: "structs-v022-browser"`. A separate
generated `/js/bootstrap.html` page loads the fingerprinted bootstrap bundle
and establishes the initial session. The normal shell resolves its bundle from
`/js/manifest.json`; keep that manifest and every emitted chunk together.
None of these test entry points is part of the production webpack build.
The generated `/js/worker-check.html` runs the actual TaskProcess and browser
Worker loader, verifies a completed proof and reports pass/fail without any
wallet, RPC connection or transaction.

Fund the test player's vault with a transaction on this isolated node, then
use the normal browser controls. Check signed API login, fresh vault balance,
selected-player transfer, exact native and indexed recipient, details/history,
device metadata and cross-tab logout. Save browser screenshots alongside
native transaction, ledger and readiness evidence. Other browser scenarios
still need their own acceptance; a successful transfer is not full release
approval.
