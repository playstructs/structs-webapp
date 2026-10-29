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
explicitly interpret that representation in their query adapter.

The existing reactor, provider-create and agreement-open builders accept the
optional v0.22 `options.ownerId` without changing their prior positional
arguments. Empty leaves the protocol's default/retained selector; explicit owner
selects its vault. `queueMsgVaultSend(ownerId, recipientOwnerId, amount, options)`
is registered. These builders do not independently establish protocol activation,
current permission/spendability, atomic withdrawal eligibility or broadcast
recovery. Those existing flow adapters must be completed before rollout. No new
UI is added. Legacy guild-create consent/work fields remain decodable; post-H
callers must leave them empty under the activation-aware adapter.

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

`legacy-wire.json` pins eight pre-migration encoder fixtures. Empty new fields
must preserve these bytes. Its provenance includes the old webapp revision and
tx source checksum; `legacy-fixtures.cjs` reproduces it from that local Git
history. The provider-decimal correction is deliberately covered by independent
Go decoding rather than preservation of the old invalid decimal encoding.
