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
timeout height for the legacy era. This helper is not yet invoked by the queue:
protocol-aware intent rebuilding, signed expiry, proof/nonces, live eligibility
and durable broadcast reconciliation must still be wired before deployment.

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
protocol metadata and LegacyDec decoding using a local WebSocket fixture.
It requires no live service. To additionally read player/address/bank data at
one verified height from a local running node (no signing or broadcast):

```sh
STRUCTS_QUERY_RPC=ws://127.0.0.1:26657 npm --prefix src run test:proto
```

`legacy-wire.json` pins eight pre-migration encoder fixtures. Empty new fields
must preserve these bytes. Its provenance includes the old webapp revision and
tx source checksum; `legacy-fixtures.cjs` reproduces it from that local Git
history. The provider-decimal correction is deliberately covered by independent
Go decoding rather than preservation of the old invalid decimal encoding.
