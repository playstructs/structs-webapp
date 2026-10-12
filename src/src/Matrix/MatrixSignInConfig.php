<?php

namespace App\Matrix;

use App\Oidc\OidcConfig;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Deployment configuration for server-side Matrix sign-in (POST /api/auth/matrix).
 *
 * The webapp here plays the part of a native Matrix client: it has a public
 * client id registered with the guild's Matrix Authentication Service and a
 * loopback redirect URI that nothing listens on. The rest is borrowed from the
 * chat and OIDC configuration that a guild running Matrix already has.
 */
class MatrixSignInConfig
{
    public const string DEFAULT_REDIRECT_URI = 'http://127.0.0.1:47411/guild/matrix/callback';

    public function __construct(
        private readonly OidcConfig $oidcConfig,
        #[Autowire(env: 'MATRIX_MAS_ISSUER')]
        private readonly string $masIssuer,
        #[Autowire(env: 'MATRIX_SIGNIN_CLIENT_ID')]
        private readonly string $clientId,
        #[Autowire(env: 'MATRIX_SIGNIN_REDIRECT_URI')]
        private readonly string $redirectUri,
        #[Autowire(env: 'MATRIX_SERVER_NAME')]
        private readonly string $serverName,
        #[Autowire(env: 'SYNAPSE_CLIENT_URL')]
        private readonly string $homeserverUrl
    ) {
    }

    public function isConfigured(): bool
    {
        return $this->findConfigurationErrors() === [];
    }

    /**
     * The MAS the browser would be sent to. When not stated it is the origin
     * of the upstream callback MAS was registered with, which is the same host.
     */
    public function getMasIssuer(): string
    {
        $issuer = rtrim($this->masIssuer, '/');

        if ($issuer !== '') {
            return $issuer;
        }

        $parts = parse_url($this->oidcConfig->getMasRedirectUri());

        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return '';
        }

        $port = isset($parts['port']) ? ":{$parts['port']}" : '';

        return "{$parts['scheme']}://{$parts['host']}{$port}";
    }

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function getRedirectUri(): string
    {
        return $this->redirectUri !== '' ? $this->redirectUri : self::DEFAULT_REDIRECT_URI;
    }

    public function getServerName(): string
    {
        return $this->serverName;
    }

    public function getHomeserverUrl(): string
    {
        return rtrim($this->homeserverUrl, '/');
    }

    /**
     * The origin this webapp answers on. Redirects that land here during the
     * sign-in chain are handled in-process rather than over the network.
     */
    public function getGuildIssuer(): string
    {
        return $this->oidcConfig->getIssuer();
    }

    /**
     * @return string[]
     */
    public function findConfigurationErrors(): array
    {
        $errors = [];

        if (!$this->oidcConfig->isEnabled()) {
            $errors[] = 'OIDC_ENABLED must be true: MAS signs players in through this webapp';
        }

        if ($this->getGuildIssuer() === '') {
            $errors[] = 'OIDC_ISSUER is not set';
        }

        if ($this->getMasIssuer() === '') {
            $errors[] = 'MATRIX_MAS_ISSUER is not set and cannot be derived from OIDC_MAS_REDIRECT_URI';
        }

        if ($this->clientId === '') {
            $errors[] = 'MATRIX_SIGNIN_CLIENT_ID is not set; run bin/console app:matrix:register-client';
        }

        if ($this->serverName === '') {
            $errors[] = 'MATRIX_SERVER_NAME is not set';
        }

        if ($this->getHomeserverUrl() === '') {
            $errors[] = 'SYNAPSE_CLIENT_URL is not set';
        }

        return $errors;
    }
}
