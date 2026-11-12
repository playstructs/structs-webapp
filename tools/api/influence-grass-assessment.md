# Influence grass assessment

Status: historical assessment, now implemented across the sibling structs-pg,
docker-structs-pg, structs-grass and docker-structs-grass checkouts. The implemented
contract is `structs-pg/docs/influence-grass-20261111.md`. Recovery uses bounded
SQL-outbox replay over Core NATS rather than requiring JetStream. An opt-in client
consumer is in `src/js/framework/InfluenceStream.js`; there is no influence UI yet.

The requirement is **data-bearing updates**: applying an ordinary influence event
must update the client's local state without another API request. An event is not
an instruction to invalidate caches or refetch standings. The API remains the
initial/history read surface; the stream maintains already loaded state.

## Findings from the current code

- `docker-structs-pg/sync-state/internal/influence/influence.go` captures raids and
  membership and calls `influence_finish_block`, but emits no influence messages.
- `internal/sync/block.go` finishes influence in the same transaction as canonical
  ingestion, before the block heartbeat. A later failure rolls the transaction
  back. This is the appropriate atomic boundary for generating influence output.
- `internal/sync/bulkwindow.go` ingests several blocks in one transaction. Existing
  transient notifications are suppressed under `structs.bulk_deferred`; influence
  projections still advance per block. Suppressing all influence output would
  leave subscribers stale and lose intermediate graph points.
- The existing schema's grass triggers serialize JSON to `pg_notify('grass', ...)`.
  Several replace oversized messages with `stub` identifiers. That behavior does
  not meet the influence requirement. `PlanetActivityNotification.js` explicitly
  performs an API read when it receives a planet-activity stub.
- `structs-grass/grass.go` forwards JSON bytes using the supplied `subject`; it does
  not interpret a fixed category enum. It retries queued batches in memory and can
  publish duplicates after an interrupted flush. Its README correctly notes that
  LISTEN disconnections, relay restarts and offline Core NATS clients can lose
  updates. NATS flush success is not durable client delivery or replay.
- Guild deltas alone cannot identify every player change. A second guild member's
  first win on an already covered planet changes personal points without changing
  guild coverage. Replacing a claim holder with another member of the same guild
  changes two players and a planet, even when the guild's final score is unchanged.

## Recommended event contract

Use a versioned envelope (`structs-influence-grass-v1`) and absolute replacement
values for mutable entities. Include deltas as additional history information,
not as the only way to update a current score. This makes duplicate delivery safe
and prevents an out-of-order delta from corrupting a cached balance.

Every scope frame includes chain ID, contest ID, build ID, block height/hash,
block time, contest mode/status, a monotonic contest commit sequence, and an
immutable event/frame ID. Numeric IDs, heights, counts, points and deltas use
exact decimal strings, matching `structs-influence-v1` API responses.

| Category | Data carried | When emitted |
|---|---|---|
| `influence_contest` | Full descriptor: bounds, weights/policy, mode, sectors, readiness, published build, progress, finality | Creation, start, finalization, published rebuild/rewind |
| `influence_scores` | Complete small guild/sector scoreboard, overall totals, ranks, ties/winners; affected per-block component deltas | Any guild score or rank change; finalization even with no raid |
| `influence_player` | Full personal totals and sector counts, current guild and previous guild, personal deltas, explicit non-additivity to guild scores | First personal planet win, claim gain/loss, membership change |
| `influence_planet` | Planet/scoring sector, latest successful raid identity/height, eligible holder or explicit null, changed guild coverage/support state | Successful raid/claim change; relevant coverage support changes |

A scoreboard update should include every affected rank, not just guilds with a
changed score. In three-sector mode, changing a guild's overall score can alter a
tiebreaker in another sector. With six guilds, sending the complete small
scoreboard avoids client-side ranking logic and rank omissions. It does not
include every player or planet.

Player and planet data should be separate subscribed scopes so a scoreboard-only
client does not receive all 10,000 players' updates. Suggested subject families:

```text
structs.influence.<chain>.<contest>.contest
structs.influence.<chain>.<contest>.scores
structs.influence.<chain>.<contest>.player.<player_id>
structs.influence.<chain>.<contest>.guild.<guild_id>
structs.influence.<chain>.<contest>.planet.<planet_id>
```

Use a stable player subject independent of guild membership. Deliver a membership
transition to both the old and new guild scopes, as well as the player's scope.
Carry the full new personal row and explicit old/new guild IDs so a client can
remove the old roster entry, upsert the new one, and update cached totals. A client
subscribed through multiple scopes deduplicates by event/entity version. For a
player who moves several times within one block, the transition is from the
block-opening guild to the final guild, not just the final intermediate move.

Zero-valued score rows and null claim holders must be transmitted explicitly.
Omission means "unchanged," never "delete." Guildless players still receive
personal updates. Claims should identify their holder by player ID; avoid copying
unversioned guild ownership into thousands of cached planet rows. Where a planet
subscription needs guild credit, include authoritative membership/coverage
transitions in that scope, rather than expecting an API lookup.

## Atomicity, traffic and charts

Collect changed players/planets/membership destinations independently of guild
score deltas while applying a block. At block completion, read final values for
those keys, compute the small scoreboard, and serialize each scope once. Do not
broadcast each projection-table INSERT/UPDATE: transfers have transient states,
and rebuilds populate unpublished generations.

The schema should own the eligibility/count calculations; Go should orchestrate
flush timing and delivery. A small transactional dirty-key table is one option
when SQL projector functions already know the previous holder/guild. Its key can
be `(build_id, height, subject_kind, subject_id)`, with the opening membership
retained on the first change. Alternatively return affected keys to the Go
tracker. Do not derive personal dirty keys solely from `influence_score_change`.
Ignore unpublished building generations; publishing a replacement build emits an
explicit replacement snapshot rather than ordinary old-build patches.

For streaming, enqueue frames after `influence_finish_block` in the existing
block transaction. For bulk ingestion, preserve each changed block's score and
personal history samples, but release delivery only after the bulk transaction
commits. Combine notifications/wakeups and compress sparse changes; do not reduce
a whole catch-up window to its final score if clients need exact graphs.

Current-state snapshots let clients replace balances. Per-block deltas/absolute
samples let them append to cached history at the original height and recompute
their current chart bucket. Empty blocks can carry the previous balance forward.
Use the existing consensus heartbeat, with compact influence watermarks if needed,
to prove progress through empty blocks; do not resend every score each block.
Finalization at the end block still emits a final frame when no score changed.

For a rebuilt generation, include replacement current state and a bounded,
complete replacement history segment (opening balance, corrected sparse samples,
range and terminal watermark) for the affected scopes. A naked "build changed"
message that makes clients refetch is not sufficient. Retain old frames as audit
records, but clients must reject old-generation patches after applying the
replacement frame. Do not use the transport journal as the permanent scoring
ledger; its retention policy serves delivery, not accounting.

## Complete payloads and recovery

Do not use the existing `stub` fallback for influence. Serialize and measure
payload bytes before publishing. Split large frames into complete bounded parts,
with `frame_id`, `part_index`, `part_count` and a content digest. A client stages
parts and atomically applies the completed scope frame. Parts/counts are scoped
**per subject/subscription**, not across unrelated player/planet subjects that a
client may never subscribe to. A shared commit ID correlates scopes without
requiring a scoreboard client to wait for every player's messages.

Recommended schema additions for delivery:

- `influence_grass_frame`: immutable header, contest/build/height, per-contest
  commit sequence, frame kind/scope and complete payload parts; indexes for
  ordered pending delivery and replay by scope. A separate parts table can enforce
  `(frame_id, part_index)` uniqueness and bounded payload sizes.
- `influence_grass_delivery`: relay/destination delivery checkpoint, separate from
  immutable event payloads. A single ordered publisher is sufficient initially.
- Optional dirty-key storage as described above, drained transactionally by the
  block or published-build finalizer.

Append outbox rows in the same transaction as scores and cursors. PostgreSQL
NOTIFY can contain only a wakeup/outbox identifier: the **relay**, not the client,
reads the durable payload. Poll/drain on startup and after reconnect so a missed
NOTIFY cannot lose an event. Advance delivery state only after the publication
acknowledgment; retrying is safe because event identities are stable. A database
or ingestion rollback must leave neither score changes nor publishable frames.

An outbox alone fixes the database-to-relay gap; it does **not** fix offline Core
NATS clients. To avoid API recovery reads after disconnection, add durable NATS
replay (for example JetStream) and retained scope snapshots/history replacement
frames. Retain the contest's required replay interval, and define how a client
resumes from its last committed scope frame or receives a complete replacement
snapshot if it is outside retention. Ordinary updates remain push-only. Initial
API reads and an explicit user request for older history are separate from
refreshing in response to an event.

The current generic relay must be extended for this delivery contract. Direct
NATS publication from sync-state before SQL commit is unsafe; after-commit
publication without a durable record has a crash gap. The current publisher's
"oversized message: log and skip" path cannot be used to silently lose influence
state. Make frame sizing and ordered replay acceptance tests, not assumptions.

## Implementation sequence and acceptance tests

1. Add the schema outbox, dirty-key collection and shared projection-to-payload
   functions. Prefer explicit block/build flushes to row notification triggers.
   Existing `grass_category` is not required by the generic relay; do not put
   score events into `planet_activity` merely to reuse that enum.
2. Extend sync-state's influence finish/bulk paths and contest publication helpers
   to enqueue committed frames. Measure the cost of reading changed players'
   unique wins; add a maintained personal unique-planet count only if necessary.
   The present API already performs targeted indexed reads efficiently.
3. Extend structs-grass with durable ordered drain/replay and complete multipart
   publishing. Configure retention/delivery authorization before enabling it.
4. Add a frontend influence store/listener that replaces rows from snapshots,
   handles old/new membership, updates history, and makes **zero GuildAPI calls**
   while applying a normal frame.

Test streaming versus bulk equivalence; two supporters on the same planet;
same-guild holder replacement; guildless moves; multiple moves in one block;
failed/ineligible raids; finalization on an empty block; exact ties; zero removals;
new build/rewind replacement; no notifications on rollback; relay restarts;
duplicate/out-of-order/missing parts; max-size guild transfers; missed LISTEN
wakeups; and reconnect replay. Assert packet-derived scores and history equal
this API at the same build/height. Instrument the frontend API client to fail if
an ordinary influence event causes a read request.
