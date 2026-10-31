# Catalog HTTP regression

Run `node tools/api/catalog-http.cjs` from the webapp worktree after deploying the
integration Sqitch plan to the disposable `structs-v022-pg` container. It requires
Docker, Node 22+, and the existing local `structs/structs-webapp:latest` and
`structs/structs-control:latest` images. This is a source/config integration check;
release-image reproducibility remains a separate packaging gate.

The runner clones that fixture into its own marked test database, starts isolated
Apache and control dev-proxy containers on random localhost ports, and exercises
the real authenticator, controllers, and restricted `structs_webapp` SQL role.
It mounts this worktree read-only and the same virtual-host config copied by the
Dockerfile. It does not use the live webapp source or database. Fixtures, containers,
and the temporary network are removed in `finally`. The source fixture is read only;
concurrent PHP and HTTP runs use different clones.

Checks include encoded IBC/factory slashes and colons, exact numeric balance order
and pagination, unchanged native/guild denomination paths, required authentication,
and refusal of invalid/double-encoded denomination parameters. Public signup
bootstrap and all approved guild reads are checked without a cookie or bearer token,
including encoded paths, HEAD, cross-origin response headers and protected device writes.
The public contract is documented in [public-guild-api.md](public-guild-api.md). The proxy uses its
packaged source, not a live-mounted control checkout. A deployed upstream proxy must
also preserve the request path; this check does not certify another operator's proxy.

PHP manager and restricted-role catalog/ownership/valuation tests live in
`src/tests/CatalogEconomyTest.php` and `src/tests/LedgerManagerTest.php` and use
`INTEGRATION_DATABASE_URL` for the disposable Sqitch database.

## Required PHP integration run

Run `node tools/api/php-integration.cjs` from this worktree. It takes a logical
snapshot of the labelled, disposable `structs-v022-pg` fixture, restores a uniquely
named test database with Timescale's restore lifecycle, disables only that clone's
background jobs, runs the entire PHP suite with `--fail-on-skipped`, and drops its
own clone in `finally`. The source fixture and live guild database are not changed.
PHPUnit refuses an `INTEGRATION_DATABASE_URL` unless its actual database name starts
with `webapp_test_` and its `structs.test_fixture` setting is `disposable-v022`.
A normal unit-only run still skips database cases; it is not migration acceptance.

Registration proof/status and pending-consent POST requests share an IP token bucket
(12-request burst, one new request per two seconds) and an application-wide bucket
(60-request burst, ten per second). Symfony's filesystem cache and flock locks share
these budgets across this container's PHP workers. A 429 includes `Retry-After` and
`Cache-Control: no-store`. Configure shared cache/locks and trusted proxies explicitly
before multi-replica/public deployment; these application limits are not edge DoS
protection. The HTTP runner checks both Apache and the control proxy, including
untrusted forwarded-IP headers. No public production origin has been accepted yet.
