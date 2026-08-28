<?php declare(strict_types=1);

namespace App\Tests\Oidc;

/**
 * Stands in for the structs.oidc_* tables and the player eligibility query.
 *
 * The provider talks to Postgres through raw DBAL, so the tests need a store
 * that responds to those statements. Dispatch is by table name, which keeps this
 * readable and means a typo in a table name fails loudly rather than silently
 * returning nothing.
 */
class InMemoryOidcDatabase
{
    /**
     * @var array<string, array<string, mixed>>
     */
    public array $clients = [];

    /**
     * @var array<string, array<string, mixed>>
     */
    public array $authorizationRequests = [];

    /**
     * @var array<string, array<string, mixed>>
     */
    public array $authorizationCodes = [];

    /**
     * @var array<string, array<string, mixed>>
     */
    public array $accessTokens = [];

    /**
     * Players considered eligible: in this guild, with an approved address.
     *
     * @var array<string, array<string, mixed>>
     */
    public array $eligiblePlayers = [];

    /**
     * The guild flagged as this deployment's own, if any. A shared webapp
     * serving several guilds has none.
     */
    public ?string $localGuildId = null;

    /**
     * @param array<string, mixed> $params
     *
     * @return array<string, mixed>|false
     */
    public function fetchAssociative(string $sql, array $params): array|false
    {
        if ($this->targets($sql, 'oidc_client')) {
            $client = $this->clients[$params['client_id']] ?? null;

            return $client === null || $client['enabled'] !== true ? false : $client;
        }

        if ($this->targets($sql, 'oidc_authorization_request')) {
            $request = $this->authorizationRequests[$params['request_id']] ?? null;

            if ($request === null || $request['consumed_at'] !== null || $request['expires_at'] < time()) {
                return false;
            }

            return $request;
        }

        if ($this->targets($sql, 'oidc_authorization_code')) {
            return $this->authorizationCodes[$params['code_hash']] ?? false;
        }

        if ($this->targets($sql, 'oidc_access_token')) {
            return $this->accessTokens[$params['jti']] ?? false;
        }

        if ($this->targets($sql, 'FROM player p')) {
            $player = $this->eligiblePlayers[$params['player_id']] ?? null;

            // The real query scopes eligibility to the requesting client's
            // guild, so the double has to as well or the cross-guild tests
            // would pass for the wrong reason.
            return $player === null || $player['guild_id'] !== $params['guild_id'] ? false : $player;
        }

        throw new \LogicException("Unrecognised SELECT in test double: {$sql}");
    }

    /**
     * @param array<string, mixed> $params
     */
    public function fetchOne(string $sql, array $params): mixed
    {
        if ($this->targets($sql, 'oidc_authorization_code')) {
            return $this->authorizationCodes[$params['code_hash']]['nonce'] ?? false;
        }

        if ($this->targets($sql, 'this_infrastructure')) {
            return $this->localGuildId ?? false;
        }

        throw new \LogicException("Unrecognised scalar SELECT in test double: {$sql}");
    }

    /**
     * @param array<string, mixed> $params
     */
    public function executeStatement(string $sql, array $params): int
    {
        if ($this->targets($sql, 'oidc_authorization_request')) {
            return $this->writeAuthorizationRequest($sql, $params);
        }

        if ($this->targets($sql, 'oidc_authorization_code')) {
            return $this->writeAuthorizationCode($sql, $params);
        }

        if ($this->targets($sql, 'oidc_access_token')) {
            return $this->writeAccessToken($sql, $params);
        }

        if ($this->targets($sql, 'oidc_client')) {
            $this->clients[$params['client_id']] = $params + ['enabled' => true];

            return 1;
        }

        throw new \LogicException("Unrecognised statement in test double: {$sql}");
    }

    /**
     * @param array<string, mixed> $params
     */
    private function writeAuthorizationRequest(string $sql, array $params): int
    {
        if (str_contains($sql, 'INSERT')) {
            $this->authorizationRequests[$params['request_id']] = $params + [
                'consumed_at' => null,
                'expires_at'  => strtotime((string) $params['expires_at']),
            ];

            return 1;
        }

        if (isset($this->authorizationRequests[$params['request_id']])) {
            $this->authorizationRequests[$params['request_id']]['consumed_at'] = time();
        }

        return 1;
    }

    /**
     * @param array<string, mixed> $params
     */
    private function writeAuthorizationCode(string $sql, array $params): int
    {
        if (str_contains($sql, 'INSERT')) {
            if (isset($this->authorizationCodes[$params['code_hash']])) {
                return 0;
            }

            $this->authorizationCodes[$params['code_hash']] = $params + ['consumed_at' => null];

            return 1;
        }

        if (isset($this->authorizationCodes[$params['code_hash']])) {
            $this->authorizationCodes[$params['code_hash']]['consumed_at'] = time();
        }

        return 1;
    }

    /**
     * @param array<string, mixed> $params
     */
    private function writeAccessToken(string $sql, array $params): int
    {
        if (str_contains($sql, 'INSERT')) {
            if (isset($this->accessTokens[$params['jti']])) {
                return 0;
            }

            $this->accessTokens[$params['jti']] = $params + ['revoked_at' => null];

            return 1;
        }

        foreach ($this->accessTokens as $jti => $token) {
            $matchesToken = isset($params['jti']) && $params['jti'] === $jti;
            $matchesCode = isset($params['auth_code_id']) && $params['auth_code_id'] === $token['auth_code_id'];
            $matchesPlayer = isset($params['player_id']) && $params['player_id'] === $token['player_id'];

            if ($matchesToken || $matchesCode || $matchesPlayer) {
                $this->accessTokens[$jti]['revoked_at'] = time();
            }
        }

        return 1;
    }

    private function targets(string $sql, string $needle): bool
    {
        return str_contains($sql, $needle);
    }
}
