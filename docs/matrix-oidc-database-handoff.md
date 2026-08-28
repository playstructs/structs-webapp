# Matrix OIDC provider database handoff

This document specifies the schema `structs-webapp` needs in order to act as
an OpenID Connect provider for Matrix Authentication Service (MAS). The schema
changes are owned by `structs-pg`; `structs-webapp` is the only reader and
writer.

Guilds that run Matrix chat need players to authenticate with their Structs
identity. The webapp already establishes a session from a Cosmos signature.
The OIDC provider is a bridge that converts that session into a standard
authorization-code flow MAS can consume. No new credential is introduced and
no wallet material is stored.

## Delivery summary

The change set adds:

- four provider tables in the existing `structs` schema, all prefixed `oidc_`;
- a `pg_cron` cleanup procedure for the three expiring tables; and
- full read/write access to those tables for `structs_webapp`.

No new schema is added. No GRASS triggers are required — nothing here is
consumed over SSE.

## Sqitch changes

Two changes, in order:

| Change | Depends on | Note |
|---|---|---|
| `table-oidc-20260826-provider` | `table-player` | Provider tables and cleanup |
| `role-structs-webapp-20260826-oidc` | `role-structs-webapp`, `table-oidc-20260826-provider` | Webapp grants |

Suggested `sqitch.plan` entries:

```
table-oidc-20260826-provider [table-player] 2026-08-26T00:00:00Z Abstrct <josh@slow.ninja> # OIDC provider tables for Matrix authentication
role-structs-webapp-20260826-oidc [role-structs-webapp table-oidc-20260826-provider] 2026-08-26T00:01:00Z Abstrct <josh@slow.ninja> # Grant the webapp OIDC provider table access
```

## `deploy/table-oidc-20260826-provider.sql`

```sql
-- Deploy structs-pg:table-oidc-20260826-provider to pg
--
-- The guild webapp acts as an OpenID Connect provider so Matrix
-- Authentication Service can use a Structs session as its upstream identity.
-- These tables hold the OAuth client registry and the short-lived state of
-- in-flight authorization-code flows. They never hold wallet material.

BEGIN;

    CREATE TABLE structs.oidc_client (
        client_id          CHARACTER VARYING PRIMARY KEY,
        guild_id           CHARACTER VARYING NOT NULL,
        name               CHARACTER VARYING,
        client_secret_hash CHARACTER VARYING,
        redirect_uris      CHARACTER VARYING[] NOT NULL DEFAULT '{}',
        scopes             CHARACTER VARYING[] NOT NULL DEFAULT '{}',
        is_confidential    BOOLEAN NOT NULL DEFAULT TRUE,
        enabled            BOOLEAN NOT NULL DEFAULT TRUE,
        created_at         TIMESTAMPTZ DEFAULT NOW(),
        updated_at         TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE structs.oidc_authorization_request (
        request_id            CHARACTER VARYING PRIMARY KEY,
        client_id             CHARACTER VARYING NOT NULL,
        redirect_uri          CHARACTER VARYING NOT NULL,
        response_type         CHARACTER VARYING NOT NULL,
        scope                 CHARACTER VARYING,
        state                 CHARACTER VARYING,
        nonce                 CHARACTER VARYING,
        code_challenge        CHARACTER VARYING,
        code_challenge_method CHARACTER VARYING,
        expires_at            TIMESTAMPTZ NOT NULL,
        consumed_at           TIMESTAMPTZ,
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE structs.oidc_authorization_code (
        code_hash             CHARACTER VARYING PRIMARY KEY,
        client_id             CHARACTER VARYING NOT NULL,
        player_id             CHARACTER VARYING NOT NULL,
        redirect_uri          CHARACTER VARYING NOT NULL,
        scope                 CHARACTER VARYING,
        nonce                 CHARACTER VARYING,
        code_challenge        CHARACTER VARYING,
        code_challenge_method CHARACTER VARYING,
        expires_at            TIMESTAMPTZ NOT NULL,
        consumed_at           TIMESTAMPTZ,
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE structs.oidc_access_token (
        jti          CHARACTER VARYING PRIMARY KEY,
        client_id    CHARACTER VARYING NOT NULL,
        player_id    CHARACTER VARYING,
        auth_code_id CHARACTER VARYING,
        scope        CHARACTER VARYING,
        expires_at   TIMESTAMPTZ NOT NULL,
        revoked_at   TIMESTAMPTZ,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX oidc_authorization_request_expires_at_idx
        ON structs.oidc_authorization_request (expires_at);
    CREATE INDEX oidc_authorization_code_expires_at_idx
        ON structs.oidc_authorization_code (expires_at);
    CREATE INDEX oidc_access_token_expires_at_idx
        ON structs.oidc_access_token (expires_at);
    CREATE INDEX oidc_access_token_player_id_idx
        ON structs.oidc_access_token (player_id);
    CREATE INDEX oidc_access_token_auth_code_id_idx
        ON structs.oidc_access_token (auth_code_id);

    CREATE OR REPLACE PROCEDURE structs.CLEAN_OIDC()
    AS
    $BODY$
    BEGIN
        DELETE FROM structs.oidc_authorization_request
            WHERE expires_at + '1 hour'::interval < NOW();
        DELETE FROM structs.oidc_authorization_code
            WHERE expires_at + '1 hour'::interval < NOW();
        DELETE FROM structs.oidc_access_token
            WHERE expires_at + '1 day'::interval < NOW();
    END
    $BODY$ LANGUAGE plpgsql SECURITY DEFINER;

    SELECT cron.schedule('oidc_cleaner', '59 seconds', 'CALL structs.CLEAN_OIDC();');

COMMIT;
```

## `revert/table-oidc-20260826-provider.sql`

```sql
-- Revert structs-pg:table-oidc-20260826-provider from pg

BEGIN;

    SELECT cron.unschedule('oidc_cleaner');

    DROP PROCEDURE IF EXISTS structs.CLEAN_OIDC();

    DROP TABLE IF EXISTS structs.oidc_access_token;
    DROP TABLE IF EXISTS structs.oidc_authorization_code;
    DROP TABLE IF EXISTS structs.oidc_authorization_request;
    DROP TABLE IF EXISTS structs.oidc_client;

COMMIT;
```

## `verify/table-oidc-20260826-provider.sql`

```sql
-- Verify structs-pg:table-oidc-20260826-provider on pg

BEGIN;

    SELECT client_id, guild_id, client_secret_hash, redirect_uris, scopes, enabled
      FROM structs.oidc_client WHERE FALSE;

    SELECT request_id, client_id, redirect_uri, code_challenge, expires_at
      FROM structs.oidc_authorization_request WHERE FALSE;

    SELECT code_hash, client_id, player_id, nonce, expires_at, consumed_at
      FROM structs.oidc_authorization_code WHERE FALSE;

    SELECT jti, client_id, player_id, auth_code_id, expires_at, revoked_at
      FROM structs.oidc_access_token WHERE FALSE;

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM cron.job WHERE jobname = 'oidc_cleaner'
        ) THEN
            RAISE EXCEPTION 'oidc_cleaner cron job is not scheduled';
        END IF;
    END
    $$;

ROLLBACK;
```

## `deploy/role-structs-webapp-20260826-oidc.sql`

The webapp is the only process that touches these tables. It inserts and
consumes rows on every login, so it needs full DML. It does not need DDL.

```sql
-- Deploy structs-pg:role-structs-webapp-20260826-oidc to pg
--
-- The webapp owns the entire OIDC provider lifecycle: it seeds the client
-- registry from deployment configuration, records in-flight authorization
-- requests, issues and consumes authorization codes, and revokes tokens.

BEGIN;

    GRANT SELECT, INSERT, UPDATE, DELETE
        ON structs.oidc_client,
           structs.oidc_authorization_request,
           structs.oidc_authorization_code,
           structs.oidc_access_token
        TO structs_webapp;

COMMIT;
```

## `revert/role-structs-webapp-20260826-oidc.sql`

```sql
-- Revert structs-pg:role-structs-webapp-20260826-oidc from pg

BEGIN;

    REVOKE SELECT, INSERT, UPDATE, DELETE
        ON structs.oidc_client,
           structs.oidc_authorization_request,
           structs.oidc_authorization_code,
           structs.oidc_access_token
        FROM structs_webapp;

COMMIT;
```

## `verify/role-structs-webapp-20260826-oidc.sql`

```sql
-- Verify structs-pg:role-structs-webapp-20260826-oidc on pg

BEGIN;

    DO $$
    DECLARE
        table_name text;
        direct_privileges integer;
    BEGIN
        FOREACH table_name IN ARRAY ARRAY[
            'oidc_client',
            'oidc_authorization_request',
            'oidc_authorization_code',
            'oidc_access_token'
        ]
        LOOP
            SELECT count(*) INTO direct_privileges
              FROM pg_class c
              CROSS JOIN LATERAL aclexplode(c.relacl) acl
             WHERE c.oid = ('structs.' || table_name)::regclass
               AND acl.grantee = 'structs_webapp'::regrole
               AND acl.privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
            IF direct_privileges <> 4 THEN
                RAISE EXCEPTION 'structs_webapp lacks full DML on structs.%', table_name;
            END IF;
        END LOOP;
    END
    $$;

ROLLBACK;
```

## Table contracts

### `structs.oidc_client`

The registry of OAuth clients permitted to use this webapp as an identity
provider. A guild that runs its own webapp holds exactly one row; a shared,
white-labeled webapp serving several guilds holds one row per guild.

`guild_id` is the guild whose players a client may authenticate, and it is the
reason this table is not simply a list of secrets. The webapp refuses to issue a
code unless the player's guild matches the client's `guild_id`, so registering a
client for Guild A gives it no ability to mint identities for Guild B's players
even though both flow through the same issuer. It is `NOT NULL` deliberately:
a nullable column would reintroduce exactly the ambiguity it exists to remove.

Rows are seeded by the webapp from deployment configuration, not by a
migration. The migration must not contain client IDs, redirect URIs, or
secrets — those differ per guild and the secret is sensitive.

`client_secret_hash` stores a PHP `password_hash` digest. The plaintext secret
exists only in the guild's secret store and in MAS configuration. Never store
or log the plaintext.

`redirect_uris` is an array because the OAuth specification permits multiple
registered URIs per client. Matching at authorize time is exact — scheme, host,
port, path, and trailing slash — so a near-miss is a rejection, never a
redirect. This is what prevents the provider from being used as an open
redirect.

### `structs.oidc_authorization_request`

An authorization request that arrived while the browser had no webapp session.

The webapp parks the validated request here, redirects the browser into the
SPA to establish a session, and then resumes the flow from this row. The row
is keyed by an opaque `request_id` rather than by the PHP session ID
deliberately: it lets a future mobile or in-app-webview flow complete a request
that was started in a different browser context, without a schema change.

`expires_at` should be roughly ten minutes out. `consumed_at` is set when the
request is resumed; a row with `consumed_at` set must not be resumed again.

### `structs.oidc_authorization_code`

A single-use authorization code bound to a client, a player, a redirect URI,
a nonce, and a PKCE challenge.

The primary key is `code_hash`, the SHA-256 digest of the code's internal
identifier rather than the identifier itself. The value the client redeems is
an encrypted envelope that never touches this table, so a database read grants
no ability to redeem anything.

`expires_at` should be roughly two minutes out. Redemption must set
`consumed_at` and reject any code that already has it set. A replayed code
means the code leaked, so redemption of an already-consumed code both fails and
revokes every access token issued against that code — which is why
`oidc_access_token` carries `auth_code_id`.

`player_id` references `structs.player.id`. No foreign key is declared, matching
the convention of the other player-adjacent tables, whose rows arrive
asynchronously from the chain indexer.

### `structs.oidc_access_token`

Issued bearer tokens, recorded so `/oauth/userinfo` can reject revoked tokens
before the token's own expiry.

`jti` is the token identifier carried in the JWT. `auth_code_id` records which
authorization code the token was minted from, so a detected code replay can
revoke the tokens that code already produced. `revoked_at` is set on logout or
on that replay path.

## Retention

`structs.CLEAN_OIDC()` runs every 59 seconds under `pg_cron`, matching the
existing `activation_code_cleaner` and `defusion_cleaner` jobs.

Rows are deleted on a grace period past expiry rather than at expiry, so that a
replayed code or token can still be recognized as a replay for a short window
instead of silently appearing as an unknown value. Grace periods are one hour
for requests and codes, one day for access tokens.

Steady-state volume is one request row and one code row per Matrix login, and
one token row per login that survives to token exchange. This is small.

## Database permissions

- `structs_webapp`: `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all four
  `structs.oidc_*` tables.
- No other role requires access. The chain indexer and crawler do not read or
  write these tables.

Existing table permissions are unchanged by this handoff.

## What is not in the database

Three things intentionally live outside the schema:

- **The ID token signing key.** An RSA private key mounted as a deployment
  secret and referenced by `OIDC_JWT_PRIVATE_KEY_PATH`. Keeping it on disk
  means the JWKS endpoint is identical across webapp replicas and a database
  read never yields token-forging material.
- **The client secret plaintext.** Held in the guild secret store and in MAS
  configuration; only its hash reaches Postgres.
- **Any wallet material.** Mnemonics, private keys, signatures, and public keys
  never enter these tables. Identity is established by the existing
  `structsd` signature check before the OIDC flow begins.

## Rollout dependency

The webapp will not serve `/.well-known/openid-configuration` until these
tables exist and the client row has been seeded. Deploy the Sqitch changes
before enabling the OIDC configuration on any guild webapp; there is no
backfill and no cutover coordination beyond ordering.
