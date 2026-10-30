# Catalog HTTP regression

Run `node tools/api/catalog-http.cjs` from the webapp worktree after deploying the
integration Sqitch plan to the disposable `structs-v022-pg` container. It requires
Docker, Node 22+, and the existing local `structs/structs-webapp:latest` and
`structs/structs-control:latest` images. This is a source/config integration check;
release-image reproducibility remains a separate packaging gate.

The runner seeds dedicated fixtures in that disposable database, starts isolated
Apache and control dev-proxy containers on random localhost ports, and exercises
the real authenticator, controllers, and restricted `structs_webapp` SQL role.
It mounts this worktree read-only and the same virtual-host config copied by the
Dockerfile. It does not use the live webapp source or database. Fixtures, containers,
and the temporary network are removed in `finally`; only the disposable database's
sequence counters can advance.

Checks include encoded IBC/factory slashes and colons, exact numeric balance order
and pagination, unchanged native/guild denomination paths, required authentication,
and refusal of invalid/double-encoded denomination parameters. The proxy uses its
packaged source, not a live-mounted control checkout. A deployed upstream proxy must
also preserve the request path; this check does not certify another operator's proxy.

PHP manager and restricted-role catalog/ownership/valuation tests live in
`src/tests/CatalogEconomyTest.php` and `src/tests/LedgerManagerTest.php` and use
`INTEGRATION_DATABASE_URL` for the disposable Sqitch database.
