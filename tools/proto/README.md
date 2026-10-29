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
`intentProtocol` remain unsent. That marker is a compatibility gate, not evidence
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

No automatic resend or replacement occurs after a lost response, timeout,
reload or height expiry. Unknown records never age out, including legacy
in-flight entries without a hash or a currently supported codec. Corrupt or
unknown storage versions are preserved and block new sends. Account sequence
alone does not identify an old intent. Keep that evidence for operator recovery;
clearing it is not a recovery procedure.

Same-origin tabs serialize signing and reconciliation with Web Locks scoped to
chain and signer. Without Web Locks, signing refuses to proceed. Verify support
and secure-origin availability in the actual deployment browsers before release;
the automated lock fixtures do not replace that browser acceptance. Independent
origins/devices do not share this local lock or journal. Logout removes wallet
and session data but retains public queue/submission evidence. A saved logout
boundary prevents old unsigned actions from resuming; previously sent records
remain available for read-only reconciliation after login.

The existing transfer/Alpha controls still require protocol-aware intent
construction, live eligibility, outcome/navigation handling and indexed-ledger
correlation. Proof persistence, multi-message withdrawal and paid/native fees
remain separate work. No screen, label or generated production asset changed.

## Verification

Install the existing application lock in `src` before testing. For an already
installed matching dependency tree elsewhere, `STRUCTS_NODE_MODULES` may point
to its absolute `node_modules` directory; nothing is installed or changed there.

```sh
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
history. The provider-decimal correction is deliberately covered by independent
Go decoding rather than preservation of the old invalid decimal encoding.
