# Matrix OIDC provider infrastructure handoff

The guild webapp can now act as an OpenID Connect identity provider. This
document is what the infrastructure team needs to point a Matrix Authentication
Service (MAS) deployment at it.

Players sign in to Matrix with the Structs identity they already have. No new
password, no second wallet signature, and no wallet material leaves the browser.

## What has to be true before this works

Three things, in order:

1. The `structs-pg` team has deployed the Sqitch changes described in
   [`matrix-oidc-database-handoff.md`](matrix-oidc-database-handoff.md).
2. The signing key exists on the webapp host and `OIDC_*` is configured.
3. `bin/console app:oidc:seed-client` has been run on the webapp.

Until `OIDC_ENABLED=true`, every `/oauth/*` route and the discovery document
return 404. That is the intended state for a guild that does not run chat.

## Deployment shapes

Two are supported, and they differ only in how many clients get registered.

**A guild running its own webapp.** One issuer, one registered client, one
Matrix server. `bin/console app:oidc:seed-client` with no arguments does the
right thing: it reads the client from the environment and infers the guild from
whichever guild is flagged as this deployment's own infrastructure.

**A shared, white-labeled webapp serving several guilds.** One issuer, one
signing key, and one registered client per guild — run the seed command once per
guild with explicit options. Each client is bound to a `guild_id` and can only
authenticate players of that guild, so a guild can have Matrix chat without
running the API infrastructure and without gaining any ability to mint
identities for another guild's players.

What is *not* supported is per-guild vanity issuers. A shared webapp is a single
issuer; every guild on it shares one `iss` value, one discovery document, and
one JWKS. If guilds need to appear as independent issuers, that is a separate
piece of work.

## Endpoints

Everything is served from the webapp's own origin.

| Purpose | URL |
|---|---|
| Issuer | `https://<webapp-host>` |
| Discovery | `https://<webapp-host>/.well-known/openid-configuration` |
| Authorization | `https://<webapp-host>/oauth/authorize` |
| Token | `https://<webapp-host>/oauth/token` |
| JWKS | `https://<webapp-host>/oauth/jwks` |
| Userinfo | `https://<webapp-host>/oauth/userinfo` |

MAS should read the discovery document rather than being configured with each
endpoint by hand. All of them are derived from `OIDC_ISSUER`, so a mismatch
there shows up as a single obvious failure instead of four subtle ones.

## What the provider supports

- Grant type: `authorization_code` only.
- PKCE: required, `S256` only. MAS is a confidential client and could skip PKCE
  under the spec; this provider rejects the request anyway.
- Refresh tokens: not issued. MAS re-runs the authorization code flow, which
  keeps every Matrix login gated on a live webapp session rather than on a
  long-lived token.
- ID token signing: RS256, key published at the JWKS endpoint with the `kid`
  from `OIDC_JWT_KEY_ID`.
- Scopes: `openid` and `profile`.
- Client authentication: `client_secret_post` or `client_secret_basic`.
- Dynamic client registration: not supported. Clients are seeded by an operator.

## Configuration to agree on

### Redirect URI

This is the one value that has to be confirmed against the actual MAS
deployment before anything will work. MAS builds its upstream callback as:

```
https://<mas-host>/upstream/callback/<provider-id>
```

where `<provider-id>` is the ULID MAS assigns to the upstream provider. It is
not knowable in advance, so the order of operations is:

1. Create the upstream OAuth2 provider in MAS.
2. Read the callback URL MAS reports for it.
3. Register it on the webapp — either by setting `OIDC_MAS_REDIRECT_URI` and
   running `bin/console app:oidc:seed-client`, or by passing it explicitly:

```bash
bin/console app:oidc:seed-client \
    --client-id=matrix-guild-alpha \
    --guild-id=0-7 \
    --redirect-uri=https://auth.alpha.example/upstream/callback/01JBX... \
    --secret="$MAS_CLIENT_SECRET"
```

Repeat step 3 per guild on a shared webapp. Each guild needs its own
`--client-id` and its own secret; reusing either would let one guild's MAS
present as another's.

Matching is exact — scheme, host, port, path, and trailing slash. A near miss is
rejected outright rather than redirected, which is what stops the provider being
usable as an open redirect. Expect the first attempt to fail on a trailing slash
and check that before looking anywhere else.

### Environment variables

Set on the guild webapp:

| Variable | Value |
|---|---|
| `OIDC_ENABLED` | `true` |
| `OIDC_ISSUER` | `https://<webapp-host>`, no trailing slash |
| `OIDC_MAS_CLIENT_ID` | default client id; ignored when `--client-id` is passed |
| `OIDC_MAS_CLIENT_SECRET` | default secret; ignored when `--secret` is passed |
| `OIDC_MAS_REDIRECT_URI` | default callback; ignored when `--redirect-uri` is passed |
| `OIDC_JWT_PRIVATE_KEY_PATH` | path to the mounted private key |
| `OIDC_JWT_PUBLIC_KEY_PATH` | path to the mounted public key |
| `OIDC_JWT_KEY_ID` | stable key identifier, e.g. `structs-oidc-1` |
| `OIDC_ENCRYPTION_KEY` | 32-byte base64 value printed by the key command |

### Secrets and where they live

Three secrets, none of which belong in the repository or in Postgres:

- **Client secret.** Generate it (`openssl rand -base64 32`), give the same value
  to MAS and to `OIDC_MAS_CLIENT_SECRET`. The webapp stores only a
  `password_hash` digest in `structs.oidc_client`.
- **Signing key.** Generated by `bin/console app:oidc:generate-key`, written to
  `config/oidc/`, which is gitignored. Mount it as a deployment secret so every
  webapp replica serves an identical JWKS. Two replicas with different keys
  produce intermittent signature failures that look like a MAS bug. The command
  is normally run as root while PHP-FPM runs as `www-data`, so it hands the keys
  and their directory to `www-data` after writing them; pass `--owner` if the web
  server runs as someone else, and read the warning it prints if it could not.
- **Encryption key.** Printed once by the same command and never written to
  disk. It encrypts authorization code envelopes; rotating it invalidates codes
  currently in flight, which is a sub-second window, but does not invalidate
  issued tokens.

Rotating the signing key invalidates every token it signed, including live
Matrix sessions. Rotating the client secret requires updating MAS and re-running
the seed command.

## Claims contract

### `sub` is the chain player ID

`sub` is `structs.player.id` — a value like `1-42`. It is immutable, which
matters because MAS turns it into a Matrix localpart and a localpart can never
change once rooms reference it.

The obvious alternative, the player's primary wallet address, was rejected: a
player can rotate it on chain, and a rotated address would orphan their entire
Matrix history. The address is published as a descriptive claim instead.

By default the Matrix ID becomes `@1-42:<guild-host>`. If a friendlier form is
wanted, do it with a MAS localpart template such as `player_{{ user.sub }}`,
not by changing `sub`.

### Claims

Present in the ID token and at the userinfo endpoint:

| Claim | Source | Notes |
|---|---|---|
| `sub` | `player.id` | always present, immutable |
| `preferred_username` | `player.username` | omitted when unset; players may change it |
| `name` | `player.username` | same value, for clients that read `name` |
| `picture` | `player.pfp` | omitted when unset |
| `guild_id` | `player.guild_id` | always equals the guild the client is registered to |
| `primary_address` | `player.primary_address` | descriptive only, never identifying |

Everything except `sub` requires the `profile` scope, and everything except
`sub` may be absent or may change. Do not key anything on them.

The ID token also carries `iss`, `aud`, `exp`, `iat`, and the `nonce` from the
authorization request.

## Who is allowed to sign in

A code is issued only when the player, at that moment:

- has a live webapp session established by a Cosmos signature login;
- signed in to the same guild the requesting client is registered for;
- is a member of that guild; and
- holds at least one `structs.player_address` row with status `approved` there.

The second and third conditions are separate on purpose. Guild membership alone
is not enough — a session established against Guild B cannot authorise a login to
Guild A's chat even for a player who belongs to both, because the session is the
only evidence of which identity the player intended to use.

Losing any of these stops new logins immediately. A revoked device also fails at
the userinfo endpoint, so an existing Matrix session stops being able to refresh
identity rather than persisting silently. Access tokens themselves live one hour
and are not revoked retroactively on revocation of an address.

## What a player experiences

Element sends the browser to `/oauth/authorize`.

If a webapp session cookie is present, the player is redirected straight back to
Matrix. They see a flash of a redirect and nothing else.

If not, the request is parked server-side and the browser is sent to the game at
`/?oidc=<request_id>`. The SPA keeps the player's wallet in local storage, so it
signs them back in during its normal boot and then returns to `/oauth/resume`,
which completes the original request. Still no prompt.

Only a genuinely new browser profile — no cookie and no local storage — needs
the existing recovery-key flow. After that completes, the same resume path runs.

Parked requests expire after ten minutes.

If cookies are blocked for the site, `/oauth/resume` answers with a plain-text
explanation rather than bouncing the browser back into the SPA. That is the
symptom to look for when a player reports a login that "just keeps loading".

## Verifying a deployment

```bash
# The provider is enabled and the issuer matches what MAS expects
curl -s https://<webapp-host>/.well-known/openid-configuration | jq .issuer

# The signing key is published
curl -s https://<webapp-host>/oauth/jwks | jq '.keys[0] | {kty, alg, kid}'
```

A 404 from either means `OIDC_ENABLED` is not `true`. A 500 from the JWKS
endpoint means the key is missing or unreadable at the configured path.

Then run one real login from Element and confirm the resulting Matrix ID
localpart is the player's chain ID.

## Failures seen in the field

Both of these were hit during the first real bring-up (crew.oh.energy,
2026-08-28) and are fixed in the webapp. They are recorded because the symptoms
point away from the cause.

### `invalid claim "exp"` on the upstream callback

MAS logs `mas_axum_utils::fancy_error: invalid claim "exp"` and returns 500 from
`/upstream/callback/<provider-id>`, after the wallet login has already succeeded.

MAS (`openidconnect-rs`) requires JWT NumericDate claims to be whole seconds.
`lcobucci/jwt` serialises `DateTimeImmutable` with microseconds by default, which
produced `"exp": 1787932162.571061` and was rejected. The provider now formats
date claims as integer Unix timestamps.

To confirm on a running deployment, decode the middle segment of a fresh
`id_token` and check that `iat` and `exp` have no decimal point.

### 500 from `/oauth/authorize` with an unreadable key

```
LogicException: Key path "file:///src/config/oidc/private.key" does not exist or is not readable
```

The keypair was generated by root and left as `root:root 0600`, so PHP-FPM
running as `www-data` could not read it. `app:oidc:generate-key` now transfers
ownership itself. On a deployment whose keys predate that change:

```bash
chown www-data:www-data config/oidc config/oidc/private.key config/oidc/public.key
chmod 750 config/oidc && chmod 640 config/oidc/private.key && chmod 644 config/oidc/public.key
```

The directory matters as much as the files — a `root:root 0750` directory blocks
traversal no matter who owns the key inside it.
