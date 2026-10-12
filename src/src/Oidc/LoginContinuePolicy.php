<?php

namespace App\Oidc;

use App\Oidc\Repository\ClientRepository;
use Throwable;

/**
 * Decides where /api/auth/login may send the browser after a form login.
 *
 * A browser form post cannot read a JSON reply, so a client that signs in this
 * way asks to be redirected afterwards. Accepting any URL there would turn the
 * login endpoint into an open redirect, so the destination is held to the one
 * place such a client legitimately needs to go: the guild's own Matrix
 * Authentication Service, whose callback is already registered as an OIDC
 * client redirect URI. Nothing new has to be configured for this to work, and
 * on a shared webapp each guild's login can only continue to that guild's MAS.
 */
class LoginContinuePolicy
{
    public function __construct(
        private readonly OidcConfig $config,
        private readonly ClientRepository $clientRepository
    ) {
    }

    /**
     * True when $continueUrl shares an origin (scheme, host and port) with a
     * redirect URI registered for the guild. The path is deliberately not
     * pinned: MAS owns its own routes, and anything on its origin is MAS.
     */
    public function isAllowed(string $continueUrl, string $guildId): bool
    {
        // A guild without chat has no auth server and, quite possibly, no
        // oidc_client table either.
        if (!$this->config->isEnabled()) {
            return false;
        }

        $origin = $this->originOf($continueUrl);

        if ($origin === null) {
            return false;
        }

        try {
            $registered = $this->clientRepository->findRedirectUrisForGuild($guildId);
        } catch (Throwable) {
            return false;
        }

        foreach ($registered as $redirectUri) {
            if ($this->originOf($redirectUri) === $origin) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalised "scheme://host[:port]" for an absolute http(s) URL, or null
     * when the URL is relative, uses another scheme, or carries userinfo
     * (which parse_url separates out, but which a browser would show to the
     * player in a way that invites confusion).
     */
    private function originOf(string $url): ?string
    {
        $parts = parse_url($url);

        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            return null;
        }

        $scheme = strtolower($parts['scheme']);

        if ($scheme !== 'https' && $scheme !== 'http') {
            return null;
        }

        $host = strtolower($parts['host']);
        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);

        return "{$scheme}://{$host}:{$port}";
    }
}
