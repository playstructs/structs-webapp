# Influence grass implementation decisions

The authoritative contract is in the sibling repository at
`structs-pg/docs/influence-grass-20261111.md`.

The original assessment proposed NATS request/reply replay. That was removed
because game clients have subscription-only access. Initial loading and recovery
after a disconnect, detected sequence gap or incomplete multipart frame use the
HTTP API. Normal influence events contain all the data needed to update already
loaded state, with no API-refetch instructions or stubs.

## Implemented boundaries

- The schema tracks personal history independently from guild union scores and
  coalesces changed players/planets through each block. Same-guild holder changes
  and multiple membership moves cannot be inferred only from guild deltas.
- Sync-state flushes final block values inside the scoring transaction, including
  deferred/bulk ingestion. Unpublished rebuilds do not emit ordinary live patches.
- A durable SQL outbox protects database-to-relay delivery. The relay only
  publishes committed frames; checkpoint advancement follows confirmed NATS flush.
  It does not subscribe to client requests and does not serve replay endpoints.
- Complete multipart payloads carry absolute scores, standings, old/new guild
  membership, planet claim/coverage and history deltas. Fixed chunks and digests
  make retries safe. Large replacement histories use bounded logical segments.
- New builds emit replacement state and history, including explicit zero/null/
  removed entities. Exact string IDs and scope predecessor IDs detect duplicates
  and gaps. Core NATS does not guarantee delivery to disconnected subscribers.
- `InfluenceStream.js` is an opt-in subscription-only helper with an application
  API snapshot loader. It subscribes before loading, buffers updates during the
  load and uses API build/height metadata to discard already-covered frames.
  No NATS publishing permissions or reply inboxes are required.

## Validation

Real PostgreSQL/Timescale tests cover transfer overlap, personal-only changes,
empty-block finalization, rollback, rebuilt/rewound generations and history
segmentation. NATS tests use read-only client permissions and publish-only relay
permissions. Client tests forbid NATS publish/request calls and verify API calls
occur only for bootstrap/recovery, not healthy updates. API parity tests compare
packet-derived standings, personal scores and sector histories to the API.

## Operation

Deploy the paired schema and writer, followed by the updated relay. No new
contest configuration is needed. Keep pending outbox frames for relay retries;
there is no automatic cleanup policy yet. Client recovery reads scoring API
state/history, not the delivery journal. No JetStream setup is required.
