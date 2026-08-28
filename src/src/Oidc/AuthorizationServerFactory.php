<?php

namespace App\Oidc;

use App\Oidc\Repository\AccessTokenRepository;
use App\Oidc\Repository\AuthCodeRepository;
use App\Oidc\Repository\ClientRepository;
use App\Oidc\Repository\RefreshTokenRepository;
use App\Oidc\Repository\ScopeRepository;
use DateInterval;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\CryptKey;
use League\OAuth2\Server\Grant\AuthCodeGrant;
use League\OAuth2\Server\ResourceServer;

class AuthorizationServerFactory
{
    private ?AuthorizationServer $authorizationServer = null;

    private ?ResourceServer $resourceServer = null;

    public function __construct(
        private readonly OidcConfig $config,
        private readonly ClientRepository $clientRepository,
        private readonly AccessTokenRepository $accessTokenRepository,
        private readonly ScopeRepository $scopeRepository,
        private readonly AuthCodeRepository $authCodeRepository,
        private readonly RefreshTokenRepository $refreshTokenRepository,
        private readonly IdTokenResponse $idTokenResponse
    ) {
    }

    public function createAuthorizationServer(): AuthorizationServer
    {
        if ($this->authorizationServer !== null) {
            return $this->authorizationServer;
        }

        $server = new AuthorizationServer(
            $this->clientRepository,
            $this->accessTokenRepository,
            $this->scopeRepository,
            new CryptKey($this->config->getPrivateKeyPath(), null, false),
            $this->config->getEncryptionKey(),
            $this->idTokenResponse
        );

        $grant = new AuthCodeGrant(
            $this->authCodeRepository,
            $this->refreshTokenRepository,
            new DateInterval(OidcConfig::AUTH_CODE_TTL)
        );

        // MAS is a confidential client and would otherwise be exempt from PKCE.
        // The provider requires it anyway, in OidcController, so that a leaked
        // authorization code is not enough on its own to obtain a token.
        $server->enableGrantType($grant, new DateInterval(OidcConfig::ACCESS_TOKEN_TTL));
        $server->setDefaultScope(OidcConfig::SCOPE_OPENID);

        return $this->authorizationServer = $server;
    }

    /**
     * Validates bearer tokens presented to the userinfo endpoint.
     */
    public function createResourceServer(): ResourceServer
    {
        if ($this->resourceServer !== null) {
            return $this->resourceServer;
        }

        return $this->resourceServer = new ResourceServer(
            $this->accessTokenRepository,
            new CryptKey($this->config->getPublicKeyPath(), null, false)
        );
    }
}
