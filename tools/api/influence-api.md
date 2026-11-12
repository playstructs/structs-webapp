# Influence API

All routes below are authenticated GET/HEAD reads under `/api/influence`.
Use the existing session or bearer-token authentication. Responses use the
standard `success`, `errors`, `data`, optional `total`, and `meta` envelope and
`Cache-Control: private, no-store`. These endpoints do not create contests,
rebuild projections, refresh aggregates, or modify scoring data.

Requires structs-pg through `influence-single-sector-20261111`. No additional
schema or sync-state deployment is required for these endpoints.

## Routes

| Route after `/api/influence` | Purpose | Query parameters |
|---|---|---|
| `/contests` or `/contests/page/{page}` | Contest configuration and availability | `chain_id`, `limit`, `after_id`, `include_total` |
| `/contests/{contest_id}` | Rules, bounds, mode and published progress | None |
| `/contests/{contest_id}/standings` | Guild standings in each scoring sector | `sector` |
| `/contests/{contest_id}/guilds/{guild_id}` | Guild totals and sector breakdown | `sector` |
| `/contests/{contest_id}/players` or `/contests/{contest_id}/players/page/{page}` | Paged personal scores, including zero-score players | `guild_id`, `sector`, `limit`, `after_id`, `include_total` |
| `/contests/{contest_id}/players/{player_id}` | Personal totals, guild at the projected height, sector breakdown | `sector` |
| `/contests/{contest_id}/history` | Contest-wide history | `start_height`, `end_height`, `bucket_blocks`, `group_by`, `sector` |
| `/contests/{contest_id}/guilds/{guild_id}/history` | One guild's history | Same history parameters |
| `/contests/{contest_id}/players/{player_id}/history` | One player's personal history | Same history parameters |

`sector` is optional: omit it for all sectors. Accepted values are `0`, `44`,
`127`, and `999`. A `single_sector` contest accepts only `0`, labelled **All
planets**. In `planet_sectors` mode, `0` means unassigned, not a geographic
sector. Standings retain unassigned scores and withhold winners until the
contest's sector requirements are satisfied.

## Scores and standings

Guild points use the union of current members' eligible planet wins plus the
maintained claims held by members. Personal points use that player's distinct
eligible planet wins plus their maintained claims. **Personal points are not
additive shares of guild points:** two players may each have won the same planet,
while their guild receives its unique-planet bonus only once. Personal responses
include `meta.score_kind = "personal"` and `meta.additive_to_guild = false`.
Guildless players retain personal achievements but credit no guild. Membership
and scores freeze at the inclusive contest ending block.

Scores contain exact decimal strings: `unique_planets`, `held_planets`, and
`points`. Guild/player detail also includes `overall_points` and `sectors`.
With a sector filter, `points` is the selected sector's score and
`overall_points` remains the score across all sectors.

Standings are a complete, small scoreboard rather than a paged leaderboard.
Each row contains `guild_id`, `sector`, component counts, `points`,
`overall_points`, `sector_rank`, `tied_for_lead`, and `is_winner`. Sector ranks
use sector points, then total guild points across the contest. Filtering a sector
does not change the overall tiebreaker. Exact positive ties share the lead/win;
zero scores never win. `is_winner` is only true after finalization. The scoreboard
includes zero rows for guilds represented in the published member roster or
historical guild balances; it is not a list of every guild registered on-chain.
Unknown/nonparticipating guilds and players return 404 rather than invented scores.

The contest status is `scheduled`, `active`, `awaiting_sectors`, `final`, or
`unavailable`. Player lists are ordered by player ID, not by score. Use standings
for guild competition rankings.

## Paging and parameters

Lists reuse the catalog API's `PaginationLimits`: default 100, maximum 10,000;
`limit=0` or an empty limit selects the default, and oversized integer limits are
clamped. Pages start at 1 and are bounded at 1,000,000. Contest ordering is numeric
`contest_id` ascending; player ordering is lexical `player_id` ascending. A page
selects its members before aggregating their scores.

`after_id` uses the same ascending ID order and replaces offset paging. It can
only be combined with page 1. `meta.has_more` and `meta.next_after_id` allow
continued reads without a count query. `include_total=1` adds an exact decimal
`total`; as with catalog reads, it counts rows matching filters and the cursor,
before LIMIT/OFFSET. Counts are omitted by default.

All parameters must be scalar, and unsupported parameters are rejected rather
than silently ignored. IDs and block parameters are validated before SQL and
bound as parameters. Decimal/exponent/negative values and integer overflow are
rejected. Heights are bounded at PHP_INT_MAX minus 1,000,000, leaving arithmetic
headroom for bucket boundaries. Guild/player IDs use their correct `0-`/`1-`
prefix and an unsigned 64-bit index.

## History and graphs

`start_height` and `end_height` are required and **inclusive**. A one-block range
is valid. Both must lie inside the contest and at or below `projected_height`.
The API rejects future/uncovered bounds with 422; it does not silently clip them.
A range cannot exceed 1,000,000 blocks. `bucket_blocks` defaults to 1,000, must
be 1–1,000,000, and may produce at most 1,000 samples per series. The entire
response is limited to 10,000 opening/sample rows across all series. Increase the
bucket size or request fewer dimensions when exceeding these limits.

| Scope | `group_by` values | Interpretation |
|---|---|---|
| Contest | `total` (default), `sector`, `guild`, `guild_sector` | Sum of awarded guild components at the requested granularity |
| One guild | `total` (default), `sector` | That guild's components, optionally split by sector |
| One player | `total` (default), `sector` | Personal achievements, independent of guild membership |

A sector filter can be combined with any allowed grouping. A player list's
`guild_id` filter is membership at the published height. It is not an instruction
to reattribute that player's historical score to that guild. Historical guild
scores already include membership transfers at their actual block heights.

History returns:

- `data.opening`: balances at the end of `start_height - 1`, by series.
- `data.samples`: balances at each bucket's ending `height`, along with its
  inclusive `start_height`, `unique_delta`, `claim_delta`, and `points_delta`.
- Series identifiers (`guild_id`, `player_id`, `sector`) appear on each relevant
  row. Samples are ordered by series, then increasing height.

Buckets are anchored at the requested start, not global multiples. A final
partial bucket ends exactly at `end_height`. Empty buckets carry the balance
forward with zero deltas. The initial baseline is required: summing only the
requested range's deltas would incorrectly reset an ongoing contest to zero.
This endpoint shows **balances inside an existing contest**, not a fresh
competition with uniqueness reset at the requested range start. Summed guild
coverage can increase after a transfer because two guilds may then each have a
supporter for the same planet; global awarded points are not conserved.

Example, using the local single-sector rehearsal (replace heights with a fully
indexed range from the contest response):

```text
GET /api/influence/contests/1/standings?sector=0
GET /api/influence/contests/1/players/page/1?guild_id=0-1&limit=100&include_total=1
GET /api/influence/contests/1/history?start_height=3545825&end_height=3546645&bucket_blocks=100&group_by=guild_sector
GET /api/influence/contests/1/guilds/0-1/history?start_height=3545825&end_height=3546645&bucket_blocks=100&group_by=sector
GET /api/influence/contests/1/players/1-1/history?start_height=3545825&end_height=3546645&bucket_blocks=100&sector=0
```

A minimal history response has this shape (illustrative values):

```json
{
  "success": true,
  "errors": [],
  "data": {
    "opening": [{"guild_id":"0-1","unique_planets":"1","held_planets":"1","points":"300"}],
    "samples": [{"guild_id":"0-1","start_height":"1002","height":"1003","unique_planets":"1","held_planets":"0","points":"100","unique_delta":"0","claim_delta":"-1","points_delta":"-200"}]
  },
  "meta": {
    "api_contract":"structs-influence-v1","contest_id":"1","build_id":"2",
    "height":"1010","projected_height":"1010","source_height":"1010",
    "data_ready":true,"scoring_mode":"single_sector","sectors_complete":true,
    "score_kind":"guild","start_height":"1002","end_height":"1003",
    "opening_height":"1001","bucket_blocks":"2","range_semantics":"inclusive_contest_balances"
  }
}
```

## Consistency and cost

Every response reads its data, optional count, published build and watermarks in
one repeatable-read snapshot. `meta.height`/`projected_height` is the score
watermark; `source_height` can be higher for a finalized contest. Every
contest-scoped response includes the build, rules, bounds, mode and readiness.
Clients combining separate requests/pages must compare build and height; those
requests are not a persistent multi-request snapshot. A rebuild changes build ID.
Block heights, IDs, counts, points, ranks and deltas are exact decimal strings;
small sectors and paging fields remain JSON integers.

Current guild scores read maintained aggregates. Player pages count wins only
for selected page members. Guild history starts from a verified checkpoint when
available and combines whole 1,000-height continuous-aggregate buckets with raw
edge/tail deltas, without overlap. A missing, stale-generation or ahead-of-build
refresh marker authorizes neither rollups nor checkpoints. Correctness does not
require the refresh job, though regular refresh reduces long-range query cost.

There is no player-delta hypertable in the current schema. Personal history uses
indexed first wins, seeks opening claims per won planet, then reads successful
raids on those planets within the requested range in canonical event order.
It handles repeated wins, same-block changes, ineligible-success claim clearing,
and later guild moves without scanning unrelated players' raid history. A very
active player with many attacked planets can still require substantial work;
monitor these reads before deciding whether to add a maintained personal ledger.

Each SQL statement is capped at five seconds. Validation errors return 400,
missing contests/participants 404, uncovered ranges or oversized result sets 422,
and an unavailable schema/build or a query timeout 503. Errors use the standard
envelope. No partial rows are returned on failure. Existing authentication is
unchanged; these routes are not added to the public guild-read matcher.

## Verification

`InfluenceManagerTest` covers parameter limits, overflow and snapshot behavior.
`InfluenceDatabaseTest` uses real projector facts and non-superuser webapp reads
on a marked disposable database: transfers, overlap, claims, personal/guild
non-additivity, frozen finals, paging, rollups/checkpoints versus raw edges,
rebuilds, ties, empty/scheduled contests and exact large values. It also exercises
10,005 members with 20,000 unrelated raid facts. The catalog HTTP runner checks
the endpoints through both Apache and the control proxy with authentication.

See `tools/api/README.md` for disposable fixture setup and full-suite commands.
No influence gameplay fixtures are inserted into the running guild database.
