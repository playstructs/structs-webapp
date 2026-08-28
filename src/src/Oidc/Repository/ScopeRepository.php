<?php

namespace App\Oidc\Repository;

use App\Oidc\Entity\ClientEntity;
use App\Oidc\Entity\ScopeEntity;
use App\Oidc\IdTokenContext;
use App\Oidc\OidcConfig;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\ScopeEntityInterface;
use League\OAuth2\Server\Repositories\ScopeRepositoryInterface;

class ScopeRepository implements ScopeRepositoryInterface
{
    public function __construct(
        private readonly OidcConfig $config,
        private readonly IdTokenContext $idTokenContext
    ) {
    }

    public function getScopeEntityByIdentifier(string $identifier): ?ScopeEntityInterface
    {
        if (!in_array($identifier, $this->config->getSupportedScopes(), true)) {
            return null;
        }

        return new ScopeEntity($identifier);
    }

    /**
     * {@inheritdoc}
     *
     * During a token request the library passes the authorization code this
     * exchange came from. That is the only hook where the code identity is
     * visible, so it is captured here for IdTokenResponse, which needs the
     * nonce that was bound to the code at authorize time.
     */
    public function finalizeScopes(
        array $scopes,
        string $grantType,
        ClientEntityInterface $clientEntity,
        string|null $userIdentifier = null,
        ?string $authCodeId = null
    ): array {
        if ($authCodeId !== null) {
            $this->idTokenContext->setAuthCodeId($authCodeId);
        }

        $allowed = $clientEntity instanceof ClientEntity
            ? $clientEntity->getAllowedScopes()
            : $this->config->getSupportedScopes();

        return array_values(array_filter(
            $scopes,
            static fn (ScopeEntityInterface $scope): bool => in_array($scope->getIdentifier(), $allowed, true)
        ));
    }
}
