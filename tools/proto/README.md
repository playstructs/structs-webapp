# Structs v0.22 generated client

Source: `playstructs/structsd` release commit
`96cea3a322c406b46ca1feb880dc4497ebd9353f`. The source checkout's current branch
and uncommitted files are not used. Buf resolves imports from that commit's
`proto/buf.lock`; it does not update dependencies. Tools are isolated here and
locked: Buf 1.53.0, ts-proto 2.6.1 and TypeScript 5.8.2. The application's
dependency lock and CosmJS versions remain unchanged.

From the repository root:

```sh
npm ci --prefix tools/proto --ignore-scripts
npm --prefix src run proto:sync -- --source /path/to/structsd
npm --prefix src run proto:check -- --source /path/to/structsd
```

Without `--source`, generation fetches the same exact commit from the public
repository into a temporary directory. Generation finishes in staging before
replacing `src/js/ts/structs.structs`. `--check` compares every output byte,
including added/removed files. No system protoc installation is needed.

The effective options are `forceLong=string`, `esModuleInterop=true`,
`snakeToCamel=true`, `useExactTypes=true`, with a single `all` plugin invocation.
`generation.json` records the source/tool/options pins, input hashes and output
hashes. `registry.ts` and request `message-schemas.json` are generated from the
same descriptors, including the custom LegacyDec annotations. Do not edit
generated codecs, registry or schemas by hand.

## JSON and wire boundaries

All generated 64-bit integer fields are decimal strings, including query values,
nonces, permissions, ranks and staking heights. Existing safe integer inputs are
normalized before queue persistence. Unsafe Numbers, out-of-range integers,
unknown request fields and malformed values are refused; converting an already
rounded Number to a string cannot recover it. Unsigned 64-bit and signed 64-bit
ranges differ. Native Coin amounts remain strings and are not limited to uint64.

`MessagePayload.normalizeMessagePayload` uses the generated request schema.
`SigningTransaction.toCosmosMsg` validates again after persisted intents reload
and injects the owning signing account as before. Queued values remain ordinary
JSON; no BigInt is stored.

Cosmos `LegacyDec` custom fields are a separate encoding boundary. Persist
human decimal strings with at most 18 decimal places. `messagePayloadToWire`
converts only annotated fields to scaled integer strings before `fromPartial`:
`"0.1"` becomes `"100000000000000000"`. Generated ts-proto does not implement
that custom Go marshaler itself. Calling its raw encoder with `"0.1"` gives
bytes the chain cannot decode. This covers the existing provider cancellation
penalties and guild conversion fee builders. Generated query/custom-decimal
results likewise retain their raw wire representation; query consumers must
explicitly interpret that representation in their query adapter. Use
`legacyDecimalFromWire` for those annotated protobuf fields; it converts the
scaled integer to exact human decimal text. Do not apply it to LCD JSON decimal
strings, ordinary Coin amounts, or all string fields indiscriminately.

The existing reactor, provider-create and agreement-open builders accept the
optional v0.22 `options.ownerId` without changing their prior positional
arguments. Empty leaves the protocol's default/retained selector; explicit owner
selects its vault. `queueMsgVaultSend(ownerId, recipientOwnerId, amount, options)`
is registered. These builders do not independently establish protocol activation,
current permission/spendability, atomic withdrawal eligibility or broadcast
recovery. Those existing flow adapters must be completed before rollout. No new
UI is added. Legacy guild-create consent/work fields remain decodable; post-H
callers must leave them empty under the activation-aware adapter.

## Query snapshots and connection ownership

`SigningClientManager.chainQuery` shares the signer's explicitly owned Comet
connection. `readSnapshot(async rpc => ..., {height})` supplies the generated
`QueryClientImpl` RPC interface. Omit height to select the fresh status height,
or supply an exact positive decimal string no higher than that node. Every query
and page must return that same height. Heights outside Number's safe range are
refused because the installed Comet API cannot represent them; amounts and
other generated 64-bit fields retain their independent exact-string domains.

```js
const result = await signingClientManager.chainQuery.readSnapshot(async rpc => {
  const query = new QueryClientImpl(rpc);
  return query.Vault({ownerId});
});
// result: {chainId, height, observedHeight, data}
```

Await all query/decode/page work inside the callback and return staged data;
do not mutate application state there. A failed transport/page cannot be caught
and converted into a successful partial snapshot. Identity and node height are
checked again before publication. Limits: 64 queries, 5 seconds per request,
15 seconds for the whole callback, 1 MiB per protobuf value and 2 MiB per RPC
JSON message. Timeouts close the owned connection. Missing/mismatched heights,
pruning, wrong chain, catching-up nodes and unsupported RPC versions fail.
This deployment supports structstestnet-111 through the installed Comet 0.38/1.0
decoder; it does not guess another network's activation height. These are
trusted-node checks, not a light-client proof of consensus.

The installed CosmJS WebSocket wrapper reconnects even when disconnect is
called. `OwnedRpcClient` implements its public execute/disconnect interface with
a native WebSocket, explicit request correlation and no automatic resend or
reconnect. The manager owns reconnection and rejects superseded initializations;
GRASS subscriptions remain separate. No dependency version changed.

`getSigningContext(meta, requiredModels)` checks the metadata from the exact API
response used by an action against fresh node identity/height. It refuses
missing, mixed-protocol or unready required models and returns an exact H-1
timeout height for the legacy era. `SigningSubmission` now applies the same
validation to fresh block metadata and obtains the signing account at a verified
query height. It signs with explicit chain/account/sequence and H-1 expiry, then
checks the wallet's body, fee, public key and signature before saving any send.
It checks the protocol again after signing. Post-H intents without the current
`intentProtocol` are refused unsent; the refusal is final, so it cannot hold the
lane. That marker is a compatibility gate, not evidence
of live permissions, spendability or proof freshness: protocol-aware action
preparation and the exact action-data snapshot checks still need integration.

## Durable submission lifecycle

The queue persists a per-intent journal under
`signingJournal:<chain-id>:<signer>:<intent-id>`, independent of the RPC endpoint.
It writes and reads back exact signed bytes/hash, then a `broadcasting` record,
before the network call. A `prepared` record alone proves that code never reached
send and may be rebuilt after revalidation. A send-marked record is unresolved
until a definitive result is saved; CheckTx acceptance alone is not success.

Reconciliation verifies transaction hash/bytes, result code and inclusion
height/index, then obtains chain identity, block hash and source time from the
matching commit/header. It uses the trusted node's transaction index, not a
Merkle/light-client proof. The existing block and resume paths can recover a
result without GRASS delivery. Terminal results are durable before waiters or
events fire. `whenSettled` can resolve a saved result after reload and callers
must check its status. `cancelQueueItem` now returns `Promise<boolean>` and
cancels only known unsent work.

Post-upgrade transactions carry a signed 60-block validity window from their
verified signing context; pre-upgrade transactions retain the H−1 deadline.
Preparation that runs past its deadline must revalidate before any send.
After a missing transaction lookup, recovery can settle a finite transaction as
expired only when a height-pinned native query after its deadline shows the same
account number and unchanged signed sequence. The signed body/authority must
match the saved expiry context. An advanced sequence, unavailable evidence or
zero timeout remains unknown. Committed inclusion takes precedence over expiry.
The real release-app tests exercise CheckTx without inclusion, timeout rejection,
successful inclusion, and failed message execution that still consumes sequence.

No automatic resend or replacement occurs after a lost response, timeout,
reload or height expiry. Proven expiry preserves the original bytes, hash and
evidence, and permits a new explicit action. Legacy in-flight entries without
signed identity cannot gain an expiry retroactively; account sequence alone
does not identify them. Corrupt/unknown storage versions also remain preserved.
Do not clear uncertain evidence to make an old intent appear safe to replace.

Same-origin tabs serialize signing and reconciliation with Web Locks scoped to
chain and signer. Without Web Locks, signing refuses to proceed. Verify support
and secure-origin availability in the actual deployment browsers before release;
the automated lock fixtures do not replace that browser acceptance. Independent
origins/devices do not share this local lock or journal. Logout removes wallet
and session data but retains public queue/submission evidence. A saved logout
boundary prevents old unsigned actions from resuming; previously sent records
remain available for read-only reconciliation after login.

The existing transfer controls now submit protocol-aware intents and observe
durable settlement, then exact indexed-ledger correlation. Reactor controls use
atomic groups and committed/indexed completion. Generator control/completion,
proof persistence and paid/native fees remain separate work. No screen, label
or generated production asset changed.

`SigningQueueManager.enqueueTransfer` now accepts a versioned user intent:
`{kind:"alpha_transfer",version:1,ownerId,recipientId,recipientAddress,amount}`.
`recipientId` is a selected player ID or NULL for an explicit literal address;
`amount` is exact ualpha for the existing whole-Alpha 1–99 control. This intent
remains independent of the resolved wire message and survives queue reload.
Only known unsent work may be re-resolved when the protocol changes.

Preparation obtains fresh player/inventory metadata and one height-pinned
native auth/player/address/vault/spendable snapshot. It checks the signing
key's own transfer bit and live owner, preserving the ordinary signer. Before H
it retains primary-source/address-recipient semantics and verifies the selected
address still belongs to that player. After H, selected players resolve through
VaultSend (including unprovisioned/prefunded vaults), while literal destinations
use PlayerSend from a provisioned source vault. Self-transfers remain valid.
Requested amounts are never reduced or replaced with retained-address funds.

The signed result is simulated at that same height before journaling a send.
Failed simulation, missing gas evidence or gas above the existing 500,000 limit
cannot broadcast; the protocol is rechecked afterwards. Indexed readiness gaps
defer known unsent work. Resolved source/destination/amount and query height are
saved with the signed submission for later ledger correlation. The tests use
real generated query codecs/offline signing with response fixtures; actual
browser acceptance and a full post-H execution rehearsal remain open.

`AlphaManager.transferAlpha(address, wholeAlpha, recipientId, signal)` preserves
the selected player ID (NULL for a literal) and returns the settled transaction.
The optional navigation signal cancels observation only. `whenSettled(id, signal)`
rejects on that signal's abort; it never interprets transport uncertainty as
failure. The unchanged confirmation screen returns a definitive rejection to
the same recipient/amount and preserves its previous Back destination. The
old amount/address-only GRASS completion listener is removed.

Success requires the signed single-message identity, matching committed hash,
chain/height/index/block time, resolved transfer context and a unique ready
sent/debit row from `getTransferSource`. Its reads time out after five seconds
and retry with 2–30 second backoff while that navigation remains active. Missing,
ambiguous or delayed rows cannot return the user to a resend screen. Navigation
aborts lookups/timers/waiters without altering the journal. Recovery remains
available after reload even when the non-restorable waiting screen is gone.

The amount control loads a fresh ready player snapshot. Post-H it floors exact
`spendable_alpha_p` and caps at the existing 99 Alpha before Number conversion;
retained wealth and stale cached `alpha` cannot set the spending limit. Missing
readiness disables the existing controls while bounded reads retry. Signing
still rechecks the full chosen amount and never silently reduces it.

## Reactor intent preparation

`SigningQueueManager.enqueueReactor` and `SigningClientManager.queueReactor`
accept `{kind:"reactor_change",version:1,ownerId,guildId,reactorId,direction,amount}`.
The direction is `infuse` or `defuse`; amount is an exact positive ualpha string
for a whole-Alpha delta. Player/guild/reactor IDs are pinned by the user's
intent, so a membership change refuses it instead of choosing another reactor.
These adapters are implemented; AlphaManager and the existing reactor controls
still need completion, preview and ready-data integration before activation.

Preparation uses fresh indexed inventory metadata and pins native reads to that
same indexed height. This makes candidate ownership and staking eligibility a
single snapshot. It checks the actor's own infuse/defuse bit, actual owner,
guild/reactor relationship, canonical validator, bond denomination and native
unbonding entry limit. Pre-H keeps the primary-address route and signed H−1
expiry. Post-H deposits use the player's vault and native spendable balance.
Withdrawals require a provisioned indexed vault plus complete positions; they
try the vault first, then retained addresses in bytewise address order, checking
each address's ownership at the selected height. Chain admission remains final
if authority, balance or queue state changes after that snapshot.

Native delegation/unbonding lists are complete, address-scoped and cursor-paged.
Empty complete lists establish absence; RPC errors never become zero balances.
Positive exact native shares and queried Coin balances are validated. Held,
zero-balance and past-time unbonding entries all consume slots until staking
removes them. A full queue makes that position ineligible; the remaining ordered
positions must cover the entire request. No partial withdrawal is submitted.

The client bounds inspection to 16 candidate positions, at most four pages of
100 rows per native list, and the existing 64-query / 15-second snapshot budget.
The signed group is at most 16 messages in one transaction. Every actual group
is simulated with the release's 20,000,000 Structs free-gas limit; this is separate
from the native staking free-gas path. Tested fixtures do not establish a
worst-case gas bound for every chain state. Oversized/incomplete requests refuse
as a whole. They are never split into successive sends.

The journal persists the entire signed group, requested delta and selected legs
as one submission. Unknown outcomes survive reload and block replacement just
like transfers. Native share conversion can make a successful cooldown amount
differ from the requested amount: the release test below pins a 1,000,000 request
returning 999,999 ualpha after a slash, and a full queried-balance request losing
one ualpha in conversion too. Completion must refresh authoritative indexed
state through the committed height, not infer a failure or fabricate a balance
change from the request. The screen completion integration remains next.

## Verification

Install both locks before testing: the suites are bundled with the application's
`src` dependencies and type-checked with the TypeScript pinned here. For an
already installed matching application tree elsewhere, `STRUCTS_NODE_MODULES` may
point to its absolute `node_modules` directory; nothing is installed or changed there.

```sh
npm ci --prefix src
npm ci --prefix tools/proto --ignore-scripts
npm --prefix src run test:proto
STRUCTS_WIRE_FIXTURE=/tmp/structs-v022-wire.json npm --prefix src run test:proto
node tools/proto/verify-release.cjs /path/to/structsd /tmp/structs-v022-wire.json
```

The first command type-checks generated bindings and targeted request types,
then runs exact integer/decimal, registry, real queue persistence/reload,
existing-builder and offline signing fixtures. It uses the existing webpack
dependencies and removes temporary build outputs. The second writes the signed
fixture with a public test mnemonic; the third archives the pinned chain release
into temporary storage and verifies each message and its signature using that
release's Go types/SDK. Nothing is broadcast; these are encoding and persistence
checks, not transaction execution, gas measurement or a network rollout proof.

The same test command also checks the query/connection lifecycle, bounds,
protocol metadata and LegacyDec decoding using a local WebSocket fixture, and
the actual queue/journal with offline signing, storage failures, overlapping-tab
lock fixtures, reload/logout, rejected/unknown outcomes and late promise results.
It requires no live service. To additionally read player/address/bank data at
one verified height from a local running node (no signing or broadcast):

```sh
STRUCTS_QUERY_RPC=ws://127.0.0.1:26657 npm --prefix src run test:proto
```

To export the actual queue's offline signed transaction and run the release
SDK decoder, signature check and timeout-height ante decorator at H-1 and H:

```sh
STRUCTS_SUBMISSION_FIXTURE=/tmp/structs-queued-tx.json npm --prefix src run test:proto
node tools/proto/verify-release.cjs /path/to/structsd /tmp/structs-queued-tx.json
```

This does not execute a game handler or broadcast. Optional
`STRUCTS_RECOVERY_FIXTURE` reads a JSON fixture containing an existing public
transaction's `bytes` (base64), `hash` (uppercase hex), `height` and `chainId`.
The transaction index is recovered from the node. The test uses the
local RPC for read-only result recovery, including the block hash/time; inspect
`submission.test.js` for the fixture contract.

`legacy-wire.json` pins eight pre-migration encoder fixtures. Empty new fields
must preserve these bytes. Its provenance includes the old webapp revision and
tx source checksum; `legacy-fixtures.cjs` reproduces it from that local Git
history (`--check` compares without writing). The provider-decimal correction is deliberately covered by independent
Go decoding rather than preservation of the old invalid decimal encoding.

Reactor preparation/atomic signing and unknown-group recovery are also included
in `test:proto`. Native responses are fixtures, while generated codecs, offline
signing and queue persistence run normally. To independently decode that actual
group and verify its signature using the pinned release:

```sh
STRUCTS_REACTOR_FIXTURE=/tmp/structs-reactor-tx.json npm --prefix src run test:proto
node tools/proto/verify-release.cjs /path/to/structsd /tmp/structs-reactor-tx.json
node tools/proto/verify-reactor-release.cjs /path/to/structsd
```

The last command archives the exact release into temporary storage and runs
real signed app/ante/staking transactions on in-memory chains. It measures
1/4/8/16 vault-plus-retained withdrawals, verifies every preceding leg rolls
back when the last fails, and checks fractional-share cooldown outcomes against
native state. It uses the same zero-ualpha fee and 20M gas limit as preparation.
It does not modify the chain checkout or broadcast on the running testnet.

The client suite also exercises reactor control/completion and shared Alpha
refresh through the real managers, queue and view handlers with controlled API
and submission responses. Alpha refresh tests cover exact vault funds, legacy
units, per-field snapshot heights, duplicate/retained notifications, owner and
session changes, H activation, index lag, native NATS reconnect status, hidden
page/resume behavior and logout cancellation. This is not a rendered-browser,
live notification delivery or full post-H rollout test. Run the existing browser
entries/tests as well when changing shared models or HUD consumers.

Generator preparation and exact preview inputs are included in `test:proto`.
`SigningClientManager.queueGenerator` accepts
`{kind:"generator_fund",version:1,ownerId,structId,amount}` with a positive
whole-Alpha ualpha string within uint64. Preparation checks the signing key's
own TokenInfuse bit, target state/type/planet and primary (pre-H) or vault
(post-H) spendability. It encodes the release's existing generator message
without invented source/owner fields, signs with zero ualpha fee/20M gas, and
simulates those exact signed bytes. An unprovisioned prefunded vault is valid;
retained liquid funds never cover a vault shortfall. Unknown signed burns stay
in the existing journal and are not resent or replaced.

`GET /api/struct/{struct_id}/generator?address={source}` reads exact stored
fuel/power totals and the selected source position with inventory snapshot
metadata. `positions_ready` must be true; malformed rows withhold the totals.
`source_exists:false` with NULL source fields proves indexed absence only when
the snapshot is ready. The address is a read selector, not spend authority.
`readGeneratorSnapshot` verifies it against same-height native player/vault
queries and reads current type rate, target eligibility and native spendability.
The preview replaces only the selected position's stored power with its new
fuel times the current rate. Untouched historical/disabled positions keep
their applied power. Divide raw milliwatts by 1,000 for displayed whole watts.
The Consume Alpha control and its completion listener are not yet migrated.

```sh
STRUCTS_GENERATOR_FIXTURE=/tmp/structs-generator-tx.json npm --prefix src run test:proto
node tools/proto/verify-release.cjs /path/to/structsd /tmp/structs-generator-tx.json
node tools/proto/verify-generator-release.cjs /path/to/structsd
```

The last command runs actual signed app/ante/bank tests in an archive of the
pinned release. It covers secondary-key authority, other-owned targets, vault
funding/burning, retained-position preservation, disabled/deferred-rate output,
full-amount rejection and uint64 overflow. It also runs the release's
`TestSignedGeneratorVaultBurnAndBatchRollback`. Each `verify-*-release.cjs`
names its tests in `release.cjs` and fails unless every named test reports PASS. No chain checkout or running testnet is
modified. Per-request simulation and full browser/rollout acceptance remain
required; these fixtures do not establish universal gas bounds.

### Session lifecycle

`session.test.js` exercises native address ownership checks on login, focus,
reconnect and a visible-page poll. A GRASS revocation prompts a read; it does
not erase the wallet by itself. Failed/stale queries and results for a replaced
wallet or connection cannot terminate the current session.

Logout publishes a shared boundary before clearing private browser storage.
Other tabs erase their in-memory key, stop signing and disable persistence
without issuing another server logout or another boundary. Game-state saves,
pending device-key writes and late wallet derivation respect that boundary.
Signed submission evidence remains available for reconciliation. These checks
cover the lifecycle without changing screens; real-browser acceptance remains
a separate release gate.

### Existing gameplay controls

The 17 message types used by the existing fleet, exploration, account-name,
struct, combat and proof-completion controls now enqueue `gameplay` intents.
The queue captures the acting player and an immutable normalized payload while
retaining each builder's immediate/action lane and caller-supplied charge gate.
`GameplayPreparation` checks current native address ownership and fixed key
permissions. Player-name editing has dynamic Update/GuildUGCUpdate authority;
the native handler decides that path. Other players' objects are not rejected
solely by owner ID because scoped grants are supported.

The actual signed transaction uses zero ualpha fees and the release's 20M free
gas cap. It is simulated at the same native height as account/authority reads
before any broadcast. The native handler checks scoped authority, charge,
destroyed/other target state, proof anchors and difficulty. Simulation is a
preflight, not a reservation: only verified inclusion establishes success.
Failures before sending cannot produce a send; ambiguous broadcasts retain
their exact durable bytes and are never recreated automatically.

The explicit allowlist in `GameplayIntent` covers these unchanged controls,
not every generated message or unused low-level builder. Old generic queued
payloads are not silently stamped v0.22. Clients should use the migrated
economic/device adapters and reviewed gameplay methods; adding another method
requires reviewing its funding, authority and state semantics first.

```sh
STRUCTS_GAMEPLAY_FIXTURE=/tmp/structs-gameplay-tx.json npm --prefix src run test:proto
node tools/proto/verify-release.cjs /path/to/structsd /tmp/structs-gameplay-tx.json
node tools/proto/verify-gameplay-release.cjs /path/to/structsd
```

The gameplay suite drives all 17 real builders and exact signing/simulation,
including reload, authority changes, protocol crossing, charge ordering and
uncertain outcomes. The release check uses real signed app transactions and
native simulation on disposable in-memory chains: build proofs, refinement to
the vault, stale anchors, destroyed state, charge and dynamic name permissions.
No running testnet state is changed. Rendered-browser acceptance remains a
separate release gate.

### Catalog/work freshness and proof recovery

The catalog API stamps its data from one consistent SQL snapshot. The client
discards the old metadata-free day-long cache, validates protocol/read readiness,
and preserves existing type-object references when a complete newer catalog
arrives. Visible polling, reconnect and activation-boundary refresh also reconcile
the player's work. Reads time out after 15 seconds; stale, conflicting, malformed
or incomplete work cannot replace or remove accepted tasks. Notifications request
a fresh read instead of supplying an unversioned proof anchor.

Finishing a hash attaches an observer to its durable queue ID. Recovery matches
the original object, category, raid target and anchor through the actual proof
input; signed bytes outrank a mutable saved intent. Unknown submissions only
reconcile. A definitive failure permits hashing again only after a newer complete
work snapshot. Removing a local task or logging out does not remove its journal.
Storage or queue pressure retains an unsent completed candidate for a later
block, while logout cancels its observer. Tutorial costs use the release's
BuildCharge=1 and extractor BuildDifficulty=10, and simulated unsupported actions
cannot enter the real queue.

The freshness and work-recovery suites exercise these paths with the real API
parsers, task/queue managers and offline signed transactions. Together with the
existing checks, `test:proto` runs every `*.test.js` file here (25 suites). It
runs all of them even after a failure, lists the failed suites, and a suite whose
main promise never settles fails. These are controlled fixtures, not
live broadcasts or full end-to-end browser acceptance. The legacy `src/js/tests`
bundle also contains Node-only global mocks; loading that bundle into a native
browser is not a valid substitute for testing the rendered controls.

## Combat event fixtures

`combat-v022.json` is generated from all 14 scenarios in the pinned release's
`x/structs/keeper/attack_event_health_test.go`. Re-capture it with:

```sh
node tools/proto/capture-combat-release.cjs /path/to/structsd tools/proto/combat-v022.json
node tools/proto/capture-combat-release.cjs /path/to/structsd tools/proto/combat-v022.json --check
```

`--check` regenerates in memory and fails unless the checked-in file matches byte
for byte. `node tools/proto/legacy-fixtures.cjs --check` does the same for
`legacy-wire.json`.

The script archives the exact release into a temporary directory, instruments
only its test to capture typed events, runs the existing assertions and refuses
a partial scenario set. It does not alter the chain checkout or send a network
transaction. These are real keeper-handler emissions using the release test
keeper, not a full-app broadcast or a live staking/consensus test. Do not edit
the generated events by hand.

The actual StructListener consumes those payloads in the combat suite. A reported
target counter plays even when final target health is zero: net volley damage
determines health at the counter, then the observed final health determines any
rebound damage and destruction. Evasion does not prematurely apply later damage.
Animation events do not replay damage into indexed state; involved structs are
refetched. The tutorial also supplies its volley total, and its test uses the
real animation factory to verify the counter's intermediate health.

## Reactor API fixture

`reactor-unprovisioned-api.json` is the restricted-role PHP response for an owner
without a provisioned vault, consumed by `reactor-flow.test.js`. Regenerate it
from the disposable integration database (see `tools/api/README.md`):

```sh
STRUCTS_REACTOR_VAULT_FIXTURE=/tmp/reactor-unprovisioned-api.json \
  node tools/api/php-integration.cjs --filter testRestrictedSqlAndNativeEvidenceCompleteOneUnprovisionedOwner
STRUCTS_REACTOR_VAULT_FIXTURE=/tmp/reactor-unprovisioned-api.json npm --prefix src run test:proto
```

The runner mounts that file's directory into the PHP container. The second command
runs the reactor flow against the fresh response; copy it over the checked-in file
after review. There is no automatic drift check for this fixture, and this path
has not been run end to end.

