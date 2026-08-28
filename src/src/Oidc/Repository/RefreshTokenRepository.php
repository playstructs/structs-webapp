<?php

namespace App\Oidc\Repository;

use League\OAuth2\Server\Entities\RefreshTokenEntityInterface;
use League\OAuth2\Server\Repositories\RefreshTokenRepositoryInterface;

/**
 * This provider does not issue refresh tokens. MAS re-runs the authorization
 * code flow when it needs a new token, which keeps every Matrix login gated on
 * a live webapp session.
 *
 * AuthCodeGrant requires a refresh token repository, so this satisfies the
 * constructor and declines. Returning null from getNewRefreshToken() is the
 * library's documented way to opt out.
 */
class RefreshTokenRepository implements RefreshTokenRepositoryInterface
{
    public function getNewRefreshToken(): ?RefreshTokenEntityInterface
    {
        return null;
    }

    public function persistNewRefreshToken(RefreshTokenEntityInterface $refreshTokenEntity): void
    {
    }

    public function revokeRefreshToken(string $tokenId): void
    {
    }

    public function isRefreshTokenRevoked(string $tokenId): bool
    {
        return true;
    }
}
