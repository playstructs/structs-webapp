<?php

namespace App\Matrix;

use DOMDocument;
use DOMElement;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Throwable;

/**
 * Obtains a Matrix session for a player by running the MAS sign-in chain the
 * way a native app does, only with this server standing in for the browser.
 *
 * The chain, with each hop followed by hand:
 *
 *   MAS /authorize  ->  MAS login  ->  this webapp /oauth/authorize (sees the
 *   player's session, issues a code)  ->  MAS upstream callback  ->  MAS
 *   consent, if any  ->  the loopback redirect URI carrying ?code=
 *
 * Hops onto this webapp's own origin are dispatched in-process as kernel
 * sub-requests carrying a session for the player, so the webapp never has to
 * call itself over the network and never has to mint a real session cookie.
 * Hops onto the MAS origin go over HTTP with a per-chain cookie jar. Anything
 * else stops the chain. The loopback URI is never visited: the code is read
 * straight out of the redirect.
 *
 * Nothing here logs: the caller decides what to record, and the exceptions
 * carry no tokens or codes to leak.
 */
class MatrixSignInRelay
{
    /**
     * A clean chain is about eight hops. Twice that with room to spare, so a
     * misconfigured MAS that loops is cut off rather than followed forever.
     */
    public const int MAX_HOPS = 20;

    public const string SCOPE_CLIENT_API = 'urn:matrix:org.matrix.msc2967.client:api:*';

    public const string SCOPE_DEVICE_PREFIX = 'urn:matrix:org.matrix.msc2967.client:device:';

    private const int TIMEOUT_SECONDS = 15;

    /**
     * Submit controls whose value means "no". A consent page with Allow and
     * Deny buttons gets the other one.
     */
    private const array REFUSING_SUBMIT_VALUES = ['deny', 'cancel', 'reject', 'no', 'decline', 'abort'];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly HttpKernelInterface $httpKernel,
        private readonly MatrixSignInConfig $config,
        private readonly MasEndpoints $endpoints
    ) {
    }

    /**
     * @throws MatrixSignInException naming the step that failed
     */
    public function signIn(string $playerId, string $guildId, string $deviceId): MatrixSession
    {
        $endpoints = $this->endpoints->forIssuer($this->config->getMasIssuer());

        $codeVerifier = $this->base64Url(random_bytes(32));
        $state = $this->base64Url(random_bytes(16));

        $authorizeUrl = $endpoints['authorization_endpoint'] . '?' . http_build_query([
            'response_type'         => 'code',
            'client_id'             => $this->config->getClientId(),
            'redirect_uri'          => $this->config->getRedirectUri(),
            'scope'                 => self::SCOPE_CLIENT_API . ' ' . self::SCOPE_DEVICE_PREFIX . $deviceId,
            'state'                 => $state,
            'code_challenge'        => $this->base64Url(hash('sha256', $codeVerifier, true)),
            'code_challenge_method' => 'S256',
        ], '', '&', PHP_QUERY_RFC3986);

        $code = $this->walkToCode($authorizeUrl, $state, $this->guildSessionFor($playerId, $guildId));
        $tokens = $this->exchangeCode($endpoints['token_endpoint'], $code, $codeVerifier);
        $whoami = $this->whoami($tokens['access_token'], $playerId);

        return new MatrixSession(
            $whoami['user_id'],
            $whoami['device_id'] ?? $deviceId,
            $tokens['access_token'],
            $tokens['refresh_token'] ?? null,
            isset($tokens['expires_in']) ? (int) $tokens['expires_in'] : null,
            $this->config->getClientId(),
            $endpoints['token_endpoint'],
            $endpoints['revocation_endpoint']
        );
    }

    /**
     * Mirrors what AuthManager::login writes, so /oauth/authorize sees exactly
     * the session a logged-in browser would carry.
     */
    private function guildSessionFor(string $playerId, string $guildId): SessionInterface
    {
        $session = new Session(new MockArraySessionStorage());
        $session->set('player_id', $playerId);
        $session->set('guild_id', $guildId);

        return $session;
    }

    /**
     * @throws MatrixSignInException
     */
    private function walkToCode(string $startUrl, string $expectedState, SessionInterface $guildSession): string
    {
        $jar = new CookieJar();
        $masOrigin = $this->originOf($this->config->getMasIssuer());
        $guildOrigin = $this->originOf($this->config->getGuildIssuer());

        $hop = ['method' => 'GET', 'url' => $startUrl, 'form' => null];

        for ($count = 0; $count < self::MAX_HOPS; $count++) {
            if ($this->isLoopbackReturn($hop['url'])) {
                return $this->codeFromLoopback($hop['url'], $expectedState);
            }

            $origin = $this->originOf($hop['url']);

            if ($origin !== null && $origin === $guildOrigin) {
                $hop = $this->followGuildHop($hop['url'], $guildSession);
                continue;
            }

            if ($origin !== null && $origin === $masOrigin) {
                $hop = $this->followMasHop($hop, $jar);
                continue;
            }

            throw new MatrixSignInException(
                MatrixSignInException::STEP_AUTHORIZE,
                'Sign-in chain was sent to an unexpected host: ' . ($this->hostOf($hop['url']) ?? '(none)')
            );
        }

        throw new MatrixSignInException(
            MatrixSignInException::STEP_AUTHORIZE,
            'Sign-in chain did not reach the redirect URI within ' . self::MAX_HOPS . ' hops'
        );
    }

    /**
     * A hop onto this webapp, served in-process with the player's session.
     *
     * @return array{method: string, url: string, form: ?array<string, string>}
     *
     * @throws MatrixSignInException
     */
    private function followGuildHop(string $url, SessionInterface $guildSession): array
    {
        $request = Request::create($url, 'GET');
        $request->setSession($guildSession);

        try {
            $response = $this->httpKernel->handle($request, HttpKernelInterface::SUB_REQUEST, false);
        } catch (Throwable $exception) {
            throw new MatrixSignInException(
                MatrixSignInException::STEP_GUILD_AUTHORIZE,
                'Webapp failed to serve ' . $this->pathOf($url) . ': ' . $exception->getMessage(),
                $exception
            );
        }

        $location = $response->headers->get('Location');

        if (!$response->isRedirection() || $location === null) {
            throw new MatrixSignInException(
                MatrixSignInException::STEP_GUILD_AUTHORIZE,
                'Webapp answered ' . $response->getStatusCode() . ' at ' . $this->pathOf($url)
                . $this->oauthErrorSuffix((string) $response->getContent())
            );
        }

        $next = $this->resolveUrl($url, $location);

        // A session is attached, so this should not happen, but if the request
        // was parked for the SPA, resume it rather than fetching the SPA.
        if ($this->originOf($next) === $this->originOf($url)) {
            parse_str((string) parse_url($next, PHP_URL_QUERY), $query);

            if (isset($query['oidc']) && is_string($query['oidc']) && $query['oidc'] !== '') {
                $next = $this->config->getGuildIssuer() . '/oauth/resume?' . http_build_query(['request_id' => $query['oidc']]);
            }
        }

        return ['method' => 'GET', 'url' => $next, 'form' => null];
    }

    /**
     * A hop onto MAS, over the network with the chain's cookies.
     *
     * @param array{method: string, url: string, form: ?array<string, string>} $hop
     *
     * @return array{method: string, url: string, form: ?array<string, string>}
     *
     * @throws MatrixSignInException
     */
    private function followMasHop(array $hop, CookieJar $jar): array
    {
        $step = $hop['form'] === null ? MatrixSignInException::STEP_AUTHORIZE : MatrixSignInException::STEP_CONSENT;

        $options = [
            'max_redirects' => 0,
            'timeout'       => self::TIMEOUT_SECONDS,
            'headers'       => ['Accept' => 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8'],
        ];

        $cookieHeader = $jar->headerFor($hop['url']);

        if ($cookieHeader !== null) {
            $options['headers']['Cookie'] = $cookieHeader;
        }

        if ($hop['form'] !== null) {
            $options['body'] = $hop['form'];
        }

        try {
            $response = $this->httpClient->request($hop['method'], $hop['url'], $options);
            $status = $response->getStatusCode();
            $headers = $response->getHeaders(false);
            $body = $response->getContent(false);
        } catch (Throwable $exception) {
            throw new MatrixSignInException($step, 'MAS unreachable at ' . $this->pathOf($hop['url']) . ': ' . $exception->getMessage(), $exception);
        }

        $jar->storeFromResponse($hop['url'], $headers['set-cookie'] ?? []);

        $location = $headers['location'][0] ?? null;

        if ($status >= 300 && $status < 400 && $location !== null) {
            return ['method' => 'GET', 'url' => $this->resolveUrl($hop['url'], $location), 'form' => null];
        }

        if ($status === 200) {
            return $this->nextHopFromPage($hop['url'], $body);
        }

        throw new MatrixSignInException($step, 'MAS answered ' . $status . ' at ' . $this->pathOf($hop['url']));
    }

    /**
     * MAS rendered a page instead of redirecting. Two kinds are expected and
     * can be answered without a person: the login page, which links to the
     * upstream provider (this webapp), and a confirmation such as consent,
     * which is a single form to post back.
     *
     * @return array{method: string, url: string, form: ?array<string, string>}
     *
     * @throws MatrixSignInException
     */
    private function nextHopFromPage(string $pageUrl, string $html): array
    {
        $document = $this->parseHtml($html);

        if ($document === null) {
            throw new MatrixSignInException(MatrixSignInException::STEP_AUTHORIZE, 'MAS answered 200 with no usable page at ' . $this->pathOf($pageUrl));
        }

        // The login page first: a MAS with password login enabled also shows a
        // password form there, which is the wrong thing to post.
        foreach ($document->getElementsByTagName('a') as $anchor) {
            $href = $anchor->getAttribute('href');

            if (str_contains($href, '/upstream/authorize/')) {
                return ['method' => 'GET', 'url' => $this->resolveUrl($pageUrl, $href), 'form' => null];
            }
        }

        foreach ($document->getElementsByTagName('form') as $form) {
            if (strtoupper($form->getAttribute('method') ?: 'GET') !== 'POST') {
                continue;
            }

            $action = $this->resolveUrl($pageUrl, $form->getAttribute('action') ?: '');

            if ($this->originOf($action) !== $this->originOf($this->config->getMasIssuer())) {
                throw new MatrixSignInException(
                    MatrixSignInException::STEP_CONSENT,
                    'MAS page at ' . $this->pathOf($pageUrl) . ' submits off the MAS host'
                );
            }

            return ['method' => 'POST', 'url' => $action, 'form' => $this->formFields($form)];
        }

        throw new MatrixSignInException(
            MatrixSignInException::STEP_CONSENT,
            'MAS showed a page that needs a person at ' . $this->pathOf($pageUrl) . ': ' . $this->titleOf($document)
        );
    }

    /**
     * What a browser would submit on a click of the form's affirmative button.
     *
     * @return array<string, string>
     */
    private function formFields(DOMElement $form): array
    {
        $fields = [];
        $submit = null;

        foreach ($form->getElementsByTagName('input') as $input) {
            $name = $input->getAttribute('name');
            $type = strtolower($input->getAttribute('type') ?: 'text');

            if ($name === '') {
                continue;
            }

            if ($type === 'submit' || $type === 'button' || $type === 'image' || $type === 'reset') {
                $submit ??= $this->affirmativeSubmit($name, $input->getAttribute('value'));
                continue;
            }

            if (($type === 'checkbox' || $type === 'radio') && !$input->hasAttribute('checked')) {
                continue;
            }

            $fields[$name] = $input->getAttribute('value');
        }

        foreach ($form->getElementsByTagName('button') as $button) {
            $name = $button->getAttribute('name');
            $type = strtolower($button->getAttribute('type') ?: 'submit');

            if ($name !== '' && $type === 'submit') {
                $submit ??= $this->affirmativeSubmit($name, $button->getAttribute('value'));
            }
        }

        if ($submit !== null) {
            $fields += $submit;
        }

        return $fields;
    }

    /**
     * @return array<string, string>|null
     */
    private function affirmativeSubmit(string $name, string $value): ?array
    {
        return in_array(strtolower(trim($value)), self::REFUSING_SUBMIT_VALUES, true) ? null : [$name => $value];
    }

    /**
     * @throws MatrixSignInException
     */
    private function codeFromLoopback(string $url, string $expectedState): string
    {
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        if (isset($query['error'])) {
            $description = isset($query['error_description']) && is_string($query['error_description'])
                ? ': ' . $query['error_description']
                : '';

            throw new MatrixSignInException(
                MatrixSignInException::STEP_CALLBACK,
                'MAS refused the authorization: ' . (string) $query['error'] . $description
            );
        }

        if (($query['state'] ?? null) !== $expectedState) {
            throw new MatrixSignInException(MatrixSignInException::STEP_CALLBACK, 'State on the redirect did not match');
        }

        $code = $query['code'] ?? null;

        if (!is_string($code) || $code === '') {
            throw new MatrixSignInException(MatrixSignInException::STEP_CALLBACK, 'Redirect carried no authorization code');
        }

        return $code;
    }

    /**
     * @return array<string, mixed> with at least access_token
     *
     * @throws MatrixSignInException
     */
    private function exchangeCode(string $tokenEndpoint, string $code, string $codeVerifier): array
    {
        try {
            $response = $this->httpClient->request('POST', $tokenEndpoint, [
                'max_redirects' => 0,
                'timeout'       => self::TIMEOUT_SECONDS,
                'headers'       => ['Accept' => 'application/json'],
                'body'          => [
                    'grant_type'    => 'authorization_code',
                    'code'          => $code,
                    'redirect_uri'  => $this->config->getRedirectUri(),
                    'client_id'     => $this->config->getClientId(),
                    'code_verifier' => $codeVerifier,
                ],
            ]);
            $status = $response->getStatusCode();
            $body = json_decode($response->getContent(false), true);
        } catch (Throwable $exception) {
            throw new MatrixSignInException(MatrixSignInException::STEP_TOKEN, 'MAS token endpoint unreachable: ' . $exception->getMessage(), $exception);
        }

        if ($status !== 200 || !is_array($body)) {
            $error = is_array($body) && is_string($body['error'] ?? null) ? ' (' . $body['error'] . ')' : '';

            throw new MatrixSignInException(MatrixSignInException::STEP_TOKEN, 'MAS token endpoint answered ' . $status . $error);
        }

        if (!is_string($body['access_token'] ?? null) || $body['access_token'] === '') {
            throw new MatrixSignInException(MatrixSignInException::STEP_TOKEN, 'MAS token response carried no access token');
        }

        return $body;
    }

    /**
     * The homeserver's own word on who the token belongs to. This is what
     * guards against a MAS whose mapping points the player at the wrong
     * account: the id has to be the chain player id on this guild's server.
     *
     * @return array{user_id: string, device_id?: string}
     *
     * @throws MatrixSignInException
     */
    private function whoami(string $accessToken, string $playerId): array
    {
        try {
            $response = $this->httpClient->request('GET', $this->config->getHomeserverUrl() . '/_matrix/client/v3/account/whoami', [
                'max_redirects' => 0,
                'timeout'       => self::TIMEOUT_SECONDS,
                'auth_bearer'   => $accessToken,
            ]);
            $status = $response->getStatusCode();
            $body = json_decode($response->getContent(false), true);
        } catch (Throwable $exception) {
            throw new MatrixSignInException(MatrixSignInException::STEP_WHOAMI, 'Homeserver unreachable: ' . $exception->getMessage(), $exception);
        }

        if ($status !== 200 || !is_array($body) || !is_string($body['user_id'] ?? null)) {
            throw new MatrixSignInException(MatrixSignInException::STEP_WHOAMI, 'Homeserver whoami answered ' . $status);
        }

        $expected = "@{$playerId}:{$this->config->getServerName()}";

        if ($body['user_id'] !== $expected) {
            throw new MatrixSignInException(
                MatrixSignInException::STEP_WHOAMI,
                "Homeserver identifies the token as {$body['user_id']}, expected {$expected}"
            );
        }

        $result = ['user_id' => $body['user_id']];

        if (is_string($body['device_id'] ?? null) && $body['device_id'] !== '') {
            $result['device_id'] = $body['device_id'];
        }

        return $result;
    }

    private function isLoopbackReturn(string $url): bool
    {
        $redirect = parse_url($this->config->getRedirectUri());
        $candidate = parse_url($url);

        if (!is_array($redirect) || !is_array($candidate)) {
            return false;
        }

        return $this->originOf($url) === $this->originOf($this->config->getRedirectUri())
            && rtrim($candidate['path'] ?? '/', '/') === rtrim($redirect['path'] ?? '/', '/');
    }

    /**
     * Only the fields an OAuth error response is defined to carry, so a stray
     * HTML or JSON body is never copied into a log line.
     */
    private function oauthErrorSuffix(string $content): string
    {
        $decoded = json_decode($content, true);

        if (!is_array($decoded) || !is_string($decoded['error'] ?? null)) {
            return '';
        }

        $hint = $decoded['hint'] ?? $decoded['error_description'] ?? null;

        return ' (' . $decoded['error'] . (is_string($hint) ? ': ' . $hint : '') . ')';
    }

    private function parseHtml(string $html): ?DOMDocument
    {
        if (trim($html) === '') {
            return null;
        }

        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);

        try {
            $loaded = $document->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        return $loaded ? $document : null;
    }

    private function titleOf(DOMDocument $document): string
    {
        $titles = $document->getElementsByTagName('title');
        $title = $titles->length > 0 ? trim((string) $titles->item(0)?->textContent) : '';

        return $title !== '' ? $title : '(untitled)';
    }

    private function resolveUrl(string $base, string $reference): string
    {
        if ($reference === '') {
            return $base;
        }

        if (preg_match('#^[a-z][a-z0-9+.-]*://#i', $reference) === 1) {
            return $reference;
        }

        $parts = parse_url($base);
        $scheme = $parts['scheme'] ?? 'https';
        $origin = $this->originAsWritten($base);

        if (str_starts_with($reference, '//')) {
            return $scheme . ':' . $reference;
        }

        if (str_starts_with($reference, '/')) {
            return $origin . $reference;
        }

        $basePath = $parts['path'] ?? '/';

        if (str_starts_with($reference, '?')) {
            return $origin . $basePath . $reference;
        }

        $directory = substr($basePath, 0, (int) strrpos($basePath, '/') + 1);

        return $origin . $directory . $reference;
    }

    /**
     * scheme://host[:port] exactly as the URL spelled it, for building URLs.
     */
    private function originAsWritten(string $url): string
    {
        $parts = parse_url($url);
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        return ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '') . $port;
    }

    /**
     * Normalised scheme://host:port, for comparing URLs.
     */
    private function originOf(string $url): ?string
    {
        $parts = parse_url($url);

        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $scheme = strtolower($parts['scheme']);
        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);

        return $scheme . '://' . strtolower($parts['host']) . ':' . $port;
    }

    private function hostOf(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST);

        return is_string($host) ? $host : null;
    }

    private function pathOf(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);

        return is_string($path) && $path !== '' ? $path : '/';
    }

    private function base64Url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }
}
