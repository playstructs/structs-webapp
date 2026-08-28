<?php

namespace App\Manager;

use App\Oidc\OidcConfig;
use DateInterval;
use DateTimeImmutable;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Parks an authorization request that arrived without a webapp session.
 *
 * The SPA has no URL router, so the request cannot be carried through the login
 * flow in the address bar. It is stored server-side instead and referenced by
 * an opaque id.
 *
 * The id is deliberately not the PHP session id: keying on the request itself
 * leaves room for a future mobile flow to complete a request that began in a
 * different browser, with no schema change.
 */
class OidcAuthorizationRequestManager
{
    /**
     * Query parameters preserved across the login detour. These are the inputs
     * to a fresh validation on resume; nothing validated is trusted from the
     * stored row.
     */
    private const array PARAMETERS = [
        'client_id',
        'redirect_uri',
        'response_type',
        'scope',
        'state',
        'nonce',
        'code_challenge',
        'code_challenge_method',
    ];

    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    /**
     * @param array<string, mixed> $queryParameters
     *
     * @throws Exception
     */
    public function park(array $queryParameters): string
    {
        $requestId = bin2hex(random_bytes(32));
        $expiresAt = (new DateTimeImmutable())->add(new DateInterval(OidcConfig::AUTHORIZE_REQUEST_TTL));

        $values = [];

        foreach (self::PARAMETERS as $parameter) {
            $value = $queryParameters[$parameter] ?? null;
            $values[$parameter] = is_string($value) && $value !== '' ? $value : null;
        }

        $this->entityManager->getConnection()->executeStatement(
            '
            INSERT INTO oidc_authorization_request (
                request_id, client_id, redirect_uri, response_type, scope, state, nonce,
                code_challenge, code_challenge_method, expires_at, created_at, updated_at
            )
            VALUES (
                :request_id, :client_id, :redirect_uri, :response_type, :scope, :state, :nonce,
                :code_challenge, :code_challenge_method, :expires_at, NOW(), NOW()
            )
            ',
            array_merge($values, [
                'request_id' => $requestId,
                'expires_at' => $expiresAt->format('Y-m-d H:i:sP'),
            ])
        );

        return $requestId;
    }

    /**
     * Rebuild the original authorize query string for an unexpired, unconsumed
     * request.
     *
     * @return array<string, string>|null
     *
     * @throws Exception
     */
    public function findPendingParameters(string $requestId): ?array
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            '
            SELECT client_id, redirect_uri, response_type, scope, state, nonce,
                   code_challenge, code_challenge_method
            FROM oidc_authorization_request
            WHERE request_id = :request_id
              AND consumed_at IS NULL
              AND expires_at > NOW()
            ',
            ['request_id' => $requestId]
        );

        if ($row === false) {
            return null;
        }

        $parameters = [];

        foreach (self::PARAMETERS as $parameter) {
            $value = $row[$parameter] ?? null;

            if (is_string($value) && $value !== '') {
                $parameters[$parameter] = $value;
            }
        }

        return $parameters;
    }

    /**
     * @throws Exception
     */
    public function consume(string $requestId): void
    {
        $this->entityManager->getConnection()->executeStatement(
            '
            UPDATE oidc_authorization_request
            SET consumed_at = NOW(), updated_at = NOW()
            WHERE request_id = :request_id
              AND consumed_at IS NULL
            ',
            ['request_id' => $requestId]
        );
    }
}
