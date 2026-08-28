<?php

namespace App\Oidc\Repository;

use App\Oidc\Entity\AccessTokenEntity;
use App\Oidc\IdTokenContext;
use Doctrine\ORM\EntityManagerInterface;
use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Exception\UniqueTokenIdentifierConstraintViolationException;
use League\OAuth2\Server\Repositories\AccessTokenRepositoryInterface;

class AccessTokenRepository implements AccessTokenRepositoryInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly IdTokenContext $idTokenContext
    ) {
    }

    public function getNewToken(
        ClientEntityInterface $clientEntity,
        array $scopes,
        string|null $userIdentifier = null
    ): AccessTokenEntityInterface {
        $accessToken = new AccessTokenEntity();
        $accessToken->setClient($clientEntity);

        if ($userIdentifier !== null) {
            $accessToken->setUserIdentifier($userIdentifier);
        }

        foreach ($scopes as $scope) {
            $accessToken->addScope($scope);
        }

        return $accessToken;
    }

    public function persistNewAccessToken(AccessTokenEntityInterface $accessTokenEntity): void
    {
        $scopes = implode(' ', array_map(
            static fn ($scope): string => $scope->getIdentifier(),
            $accessTokenEntity->getScopes()
        ));

        $affected = $this->entityManager->getConnection()->executeStatement(
            '
            INSERT INTO oidc_access_token (
                jti, client_id, player_id, auth_code_id, scope, expires_at, created_at, updated_at
            )
            VALUES (
                :jti, :client_id, :player_id, :auth_code_id, :scope, :expires_at, NOW(), NOW()
            )
            ON CONFLICT (jti) DO NOTHING
            ',
            [
                'jti'          => $accessTokenEntity->getIdentifier(),
                'client_id'    => $accessTokenEntity->getClient()->getIdentifier(),
                'player_id'    => $accessTokenEntity->getUserIdentifier(),
                'auth_code_id' => $this->idTokenContext->getAuthCodeId(),
                'scope'        => $scopes,
                'expires_at'   => $accessTokenEntity->getExpiryDateTime()->format('Y-m-d H:i:sP'),
            ]
        );

        if ($affected === 0) {
            throw UniqueTokenIdentifierConstraintViolationException::create();
        }
    }

    public function revokeAccessToken(string $tokenId): void
    {
        $this->entityManager->getConnection()->executeStatement(
            '
            UPDATE oidc_access_token
            SET revoked_at = NOW(), updated_at = NOW()
            WHERE jti = :jti
              AND revoked_at IS NULL
            ',
            ['jti' => $tokenId]
        );
    }

    /**
     * A token we have never seen is treated as revoked. Tokens are recorded at
     * issue time, so an unknown identifier is either forged or expired past the
     * retention window.
     */
    public function isAccessTokenRevoked(string $tokenId): bool
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            '
            SELECT revoked_at
            FROM oidc_access_token
            WHERE jti = :jti
            ',
            ['jti' => $tokenId]
        );

        return $row === false || $row['revoked_at'] !== null;
    }

    /**
     * Replaying an authorization code means the code leaked, so anything it
     * already produced has to be withdrawn (RFC 6749 section 4.1.2).
     */
    public function revokeTokensForAuthCode(string $authCodeId): void
    {
        $this->entityManager->getConnection()->executeStatement(
            '
            UPDATE oidc_access_token
            SET revoked_at = NOW(), updated_at = NOW()
            WHERE auth_code_id = :auth_code_id
              AND revoked_at IS NULL
            ',
            ['auth_code_id' => $authCodeId]
        );
    }

    /**
     * Used at logout to cut every Matrix session this player holds.
     */
    public function revokeTokensForPlayer(string $playerId): void
    {
        $this->entityManager->getConnection()->executeStatement(
            '
            UPDATE oidc_access_token
            SET revoked_at = NOW(), updated_at = NOW()
            WHERE player_id = :player_id
              AND revoked_at IS NULL
            ',
            ['player_id' => $playerId]
        );
    }
}
