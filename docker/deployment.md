# Webapp origin and native-read requirements

Build the assets with the image. The production shell uses the emitted manifest
and fingerprinted bundles together; a source checkout without that build is not
a deployable image. Run Symfony cache commands as the web server user so the
runtime cache remains writable.

## Public origin

Signing requires a secure browser context with Web Locks. Loopback HTTP is a
development exception; a public HTTP origin is unsupported. Before a public
rollout, configure HTTPS and secure WebSocket routing for RPC and GRASS, then
test login, signing, reload and simultaneous tabs on the actual origin. A passing
localhost check does not establish that deployment's readiness.

## Client IP behind a reverse proxy

The installed Symfony kernel supports these environment variables:

```text
SYMFONY_TRUSTED_PROXIES=<actual proxy IPs or controlled proxy CIDRs>
SYMFONY_TRUSTED_HEADERS=x-forwarded-for,x-forwarded-proto
```

Set them on the webapp container, scoped to proxies that control those headers.
The edge must set or append the real connecting client IP correctly. Do not trust
all networks or client-supplied forwarding headers. Without proxy configuration,
Symfony uses the proxy's IP, so clients behind it share the per-client bucket.
Direct deployments need no trusted proxy setting. TLS termination also needs the
forwarded protocol to describe the external HTTPS request correctly.

Registration proof, status and pending-consent requests share per-client and
global limits. The HTTP regression tests exercise the real kernel environment
settings, independent forwarded clients and a forged earlier hop.

## Retained-funds reads

The player endpoint verifies at most 16 indexed candidate addresses. Identical
evidence is shared by owner, native endpoint, chain, exact height, vault and
candidate window. A changed boundary forces fresh verification; failed or
partial evidence is never cached. One cache slot per owner is replaced and
expires after 60 seconds. A shared lock avoids duplicate work by PHP workers.

Before an uncached read, the limiter reserves one native chain query plus two
queries per candidate. Defaults in `src/config/packages/rate_limiter.yaml` are
66 tokens/client replenished at 8/second, and 264 global tokens replenished at
32/second. Cache hits use no query budget. Rotating target players does not reset
either budget. If verification cannot run, retained evidence is unavailable and
the independently verified vault remains usable. Signing still rechecks native
ownership and spendability; cached API evidence never authorizes a transaction.

Cache and limiter state are shared by PHP workers within one container. Multiple
replicas require shared cache/lock storage or equivalent limits at their common
edge; these defaults do not claim a cluster-wide budget.
