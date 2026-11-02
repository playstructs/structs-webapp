# Public guild reads

The following Guild API routes accept anonymous `GET` and `HEAD` requests. This is
an explicit access policy for guild discovery, signup and sharing statistics across
guilds. Existing response shapes and the webapp UI are unchanged.

| Route | Data |
| --- | --- |
| `/api/guild/this` | The guild hosting this deployment |
| `/api/guild/name` | Guild name filter list |
| `/api/guild/count` | Guild count |
| `/api/guild/directory` | Guild directory |
| `/api/guild/{guild_id}` | Guild profile |
| `/api/guild/{guild_id}/name` | Guild name |
| `/api/guild/{guild_id}/members/count` | Member count |
| `/api/guild/{guild_id}/power/stats` | Guild power statistics |
| `/api/guild/{guild_id}/roster` | Member profiles and existing displayed Alpha totals |
| `/api/guild/{guild_id}/planet/complete/count` | Completed planet count |

`guild_id` must have the form `0-N`, with decimal digits for `N`. Public access is
limited to these exact paths and methods. A new route under `/api/guild/` does not
automatically become public. Symfony decodes the path once for routing and access
matching, so percent-encoding a letter or slash does not change the access policy.
An upstream proxy may reject or route an encoded path differently; use ordinary URLs.

For browser requests from another origin, these guild reads return
`Access-Control-Allow-Origin: *`. Omit credentials and use a simple request:

```javascript
const response = await fetch(`${guildBaseUrl}/api/guild/0-1/power/stats`, {
  credentials: 'omit',
  headers: {Accept: 'application/json'},
});
const result = await response.json();
if (!response.ok || !result.success) throw new Error('Guild statistics unavailable');
const stats = result.data;
```

Do not send a bearer token or cookies for these anonymous reads. Read preflights
also accept `Accept` and `Content-Type`, so existing clients such as `JsonAjaxer`
that set JSON `Content-Type` on GET can use these routes. Successful OPTIONS
responses are empty (204), allow only GET/HEAD, and never execute a controller.
Credentialed CORS, authorization headers and write-method preflights are not part
of this public read contract.

The existing `/api/auth/`, `/api/setting`, `/api/timestamp` and onboarding telemetry
exceptions remain in place. Signup and login continue validating their own signed
requests. Public signup does not grant access to account/device management.
Other API routes, including player, provider and inventory catalogs, retain their
authentication requirements. No new cross-origin policy is added to those routes.

Implementation uses one `PublicGuildReadMatcher` for both the firewall exemption
and public response headers. Regression coverage lives in
`src/tests/PlayerAuthenticatorPathTest.php` and `tools/api/catalog-http.cjs`.
