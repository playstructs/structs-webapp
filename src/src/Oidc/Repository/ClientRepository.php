<?php

namespace App\Oidc\Repository;

use App\Oidc\Entity\ClientEntity;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Repositories\ClientRepositoryInterface;

class ClientRepository implements ClientRepositoryInterface
{
    /**
     * This provider only ever issues authorization codes. Refresh tokens are
     * deliberately absent, and ClientEntity::supportsGrantType() is what stops
     * the library from minting them.
     */
    public const array GRANT_TYPES = ['authorization_code'];

    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function getClientEntity(string $clientIdentifier): ?ClientEntityInterface
    {
        $row = $this->findEnabledClient($clientIdentifier);

        return $row === null ? null : $this->hydrate($row);
    }

    public function validateClient(string $clientIdentifier, ?string $clientSecret, ?string $grantType): bool
    {
        $row = $this->findEnabledClient($clientIdentifier);

        if ($row === null) {
            return false;
        }

        if ($grantType !== null && !in_array($grantType, self::GRANT_TYPES, true)) {
            return false;
        }

        if (!$row['is_confidential']) {
            return true;
        }

        $hash = (string) ($row['client_secret_hash'] ?? '');

        if ($hash === '' || $clientSecret === null || $clientSecret === '') {
            return false;
        }

        return password_verify($clientSecret, $hash);
    }

    /**
     * Upsert used by app:oidc:seed-client. The registry is deployment
     * configuration, so it is reconciled from the environment on every deploy
     * rather than edited by hand.
     *
     * @param string[] $redirectUris
     * @param string[] $scopes
     *
     * @throws Exception
     */
    public function save(
        string $clientIdentifier,
        string $guildId,
        string $name,
        string $clientSecret,
        array $redirectUris,
        array $scopes,
        bool $isConfidential = true
    ): void {
        $this->entityManager->getConnection()->executeStatement(
            '
            INSERT INTO oidc_client (
                client_id, guild_id, name, client_secret_hash, redirect_uris, scopes,
                is_confidential, enabled, created_at, updated_at
            )
            VALUES (
                :client_id, :guild_id, :name, :secret_hash, :redirect_uris, :scopes,
                :is_confidential, TRUE, NOW(), NOW()
            )
            ON CONFLICT (client_id) DO UPDATE SET
                guild_id           = EXCLUDED.guild_id,
                name               = EXCLUDED.name,
                client_secret_hash = EXCLUDED.client_secret_hash,
                redirect_uris      = EXCLUDED.redirect_uris,
                scopes             = EXCLUDED.scopes,
                is_confidential    = EXCLUDED.is_confidential,
                enabled            = TRUE,
                updated_at         = NOW()
            ',
            [
                'client_id'       => $clientIdentifier,
                'guild_id'        => $guildId,
                'name'            => $name,
                'secret_hash'     => password_hash($clientSecret, PASSWORD_DEFAULT),
                'redirect_uris'   => $this->toArrayLiteral($redirectUris),
                'scopes'          => $this->toArrayLiteral($scopes),
                'is_confidential' => $isConfidential ? 'true' : 'false',
            ]
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findEnabledClient(string $clientIdentifier): ?array
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            '
            SELECT client_id, guild_id, name, client_secret_hash, redirect_uris, scopes, is_confidential
            FROM oidc_client
            WHERE client_id = :client_id
              AND enabled = TRUE
            ',
            ['client_id' => $clientIdentifier]
        );

        return $row === false ? null : $row;
    }

    /**
     * @param array<string, mixed> $row
     */
    private function hydrate(array $row): ClientEntity
    {
        return new ClientEntity(
            (string) $row['client_id'],
            (string) $row['guild_id'],
            (string) ($row['name'] ?? $row['client_id']),
            $this->toList($row['redirect_uris']),
            self::GRANT_TYPES,
            $this->toList($row['scopes']),
            (bool) $row['is_confidential']
        );
    }

    /**
     * Postgres hands back array columns as a literal such as {a,b}. DBAL does
     * not convert those without an explicit array type, so unpack them here.
     *
     * @return string[]
     */
    private function toList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), static fn (string $v): bool => $v !== ''));
        }

        if (!is_string($value) || $value === '' || $value === '{}') {
            return [];
        }

        $parsed = str_getcsv(trim($value, '{}'), ',', '"', '\\');

        return array_values(array_filter(
            array_map(static fn (?string $v): string => trim((string) $v), $parsed),
            static fn (string $v): bool => $v !== ''
        ));
    }

    /**
     * @param string[] $values
     */
    private function toArrayLiteral(array $values): string
    {
        $quoted = array_map(
            static fn (string $value): string => '"' . str_replace(['\\', '"'], ['\\\\', '\\"'], $value) . '"',
            $values
        );

        return '{' . implode(',', $quoted) . '}';
    }
}
