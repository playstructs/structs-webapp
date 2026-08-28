<?php

namespace App\Oidc\Repository;

use App\Oidc\Entity\AuthCodeEntity;
use Doctrine\ORM\EntityManagerInterface;
use League\OAuth2\Server\Entities\AuthCodeEntityInterface;
use League\OAuth2\Server\Exception\UniqueTokenIdentifierConstraintViolationException;
use League\OAuth2\Server\Repositories\AuthCodeRepositoryInterface;

class AuthCodeRepository implements AuthCodeRepositoryInterface
{
    /**
     * The nonce and PKCE challenge for the code currently being issued. The
     * library builds the code entity itself through getNewAuthCode(), so the
     * authorize controller stages these values on the repository first.
     */
    private ?string $pendingNonce = null;

    private ?string $pendingCodeChallenge = null;

    private ?string $pendingCodeChallengeMethod = null;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AccessTokenRepository $accessTokenRepository
    ) {
    }

    public function stageAuthorizationDetails(
        ?string $nonce,
        ?string $codeChallenge,
        ?string $codeChallengeMethod
    ): void {
        $this->pendingNonce = $nonce;
        $this->pendingCodeChallenge = $codeChallenge;
        $this->pendingCodeChallengeMethod = $codeChallengeMethod;
    }

    public function getNewAuthCode(): AuthCodeEntityInterface
    {
        $authCode = new AuthCodeEntity();
        $authCode->setNonce($this->pendingNonce);
        $authCode->setCodeChallenge($this->pendingCodeChallenge);
        $authCode->setCodeChallengeMethod($this->pendingCodeChallengeMethod);

        return $authCode;
    }

    public function persistNewAuthCode(AuthCodeEntityInterface $authCodeEntity): void
    {
        $scopes = implode(' ', array_map(
            static fn ($scope): string => $scope->getIdentifier(),
            $authCodeEntity->getScopes()
        ));

        $affected = $this->entityManager->getConnection()->executeStatement(
            '
            INSERT INTO oidc_authorization_code (
                code_hash, client_id, player_id, redirect_uri, scope, nonce,
                code_challenge, code_challenge_method, expires_at, created_at, updated_at
            )
            VALUES (
                :code_hash, :client_id, :player_id, :redirect_uri, :scope, :nonce,
                :code_challenge, :code_challenge_method, :expires_at, NOW(), NOW()
            )
            ON CONFLICT (code_hash) DO NOTHING
            ',
            [
                'code_hash'             => $this->hash($authCodeEntity->getIdentifier()),
                'client_id'             => $authCodeEntity->getClient()->getIdentifier(),
                'player_id'             => $authCodeEntity->getUserIdentifier(),
                'redirect_uri'          => $authCodeEntity->getRedirectUri(),
                'scope'                 => $scopes,
                'nonce'                 => $authCodeEntity instanceof AuthCodeEntity ? $authCodeEntity->getNonce() : null,
                'code_challenge'        => $authCodeEntity instanceof AuthCodeEntity ? $authCodeEntity->getCodeChallenge() : null,
                'code_challenge_method' => $authCodeEntity instanceof AuthCodeEntity ? $authCodeEntity->getCodeChallengeMethod() : null,
                'expires_at'            => $authCodeEntity->getExpiryDateTime()->format('Y-m-d H:i:sP'),
            ]
        );

        if ($affected === 0) {
            throw UniqueTokenIdentifierConstraintViolationException::create();
        }
    }

    /**
     * Called by the library once a code has been successfully exchanged.
     */
    public function revokeAuthCode(string $codeId): void
    {
        $this->entityManager->getConnection()->executeStatement(
            '
            UPDATE oidc_authorization_code
            SET consumed_at = NOW(), updated_at = NOW()
            WHERE code_hash = :code_hash
              AND consumed_at IS NULL
            ',
            ['code_hash' => $this->hash($codeId)]
        );
    }

    /**
     * A code is spent once it has been consumed. An unknown code is treated as
     * revoked too: it is either forged or old enough to have been cleaned up,
     * and neither should be redeemable.
     *
     * This is also the only point where a replay is visible. Presenting a code
     * that was already exchanged means the code leaked, so whatever it produced
     * the first time is withdrawn here (RFC 6749 section 4.1.2).
     */
    public function isAuthCodeRevoked(string $codeId): bool
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            '
            SELECT consumed_at
            FROM oidc_authorization_code
            WHERE code_hash = :code_hash
            ',
            ['code_hash' => $this->hash($codeId)]
        );

        if ($row === false) {
            return true;
        }

        if ($row['consumed_at'] === null) {
            return false;
        }

        $this->accessTokenRepository->revokeTokensForAuthCode($codeId);

        return true;
    }

    public function getNonce(string $codeId): ?string
    {
        $nonce = $this->entityManager->getConnection()->fetchOne(
            '
            SELECT nonce
            FROM oidc_authorization_code
            WHERE code_hash = :code_hash
            ',
            ['code_hash' => $this->hash($codeId)]
        );

        return $nonce === false || $nonce === null ? null : (string) $nonce;
    }

    /**
     * The redeemable value is an encrypted envelope held only by the client.
     * Storing a digest of the internal identifier means a database read cannot
     * be turned into a redemption.
     */
    private function hash(string $codeId): string
    {
        return hash('sha256', $codeId);
    }
}
