<?php

namespace App\Manager;

use App\Oidc\OidcConfig;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Decides whether a logged-in player may receive OIDC tokens for this guild,
 * and produces the claims that describe them.
 *
 * `username` and `pfp` live on the player table but are not mapped on
 * App\Entity\Player, so they are read with SQL the same way PlayerManager does.
 */
class OidcClaimsManager
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    /**
     * Load a player only if they are eligible to authenticate to the Matrix
     * deployment belonging to a given guild: they must be a member of that
     * guild and still hold an approved address there.
     *
     * The guild comes from the OAuth client, not from this deployment. One
     * webapp can serve several guilds behind one issuer, so binding eligibility
     * to the requesting client is what stops Guild A's Matrix server from
     * authenticating Guild B's players.
     *
     * A revoked device or a player who has left the guild gets nothing back, so
     * every caller has a single condition to check.
     *
     * @return array<string, mixed>|null
     *
     * @throws Exception
     */
    public function findEligiblePlayer(string $playerId, string $guildId): ?array
    {
        $row = $this->entityManager->getConnection()->fetchAssociative(
            '
            SELECT
              p.id,
              p.primary_address,
              p.guild_id,
              p.username,
              p.pfp
            FROM player p
            WHERE p.id = :player_id
              AND p.guild_id = :guild_id
              AND EXISTS (
                SELECT 1
                FROM player_address pa
                WHERE pa.player_id = p.id
                  AND pa.guild_id = p.guild_id
                  AND pa.status = \'approved\'
              )
            LIMIT 1
            ',
            [
                'player_id' => $playerId,
                'guild_id'  => $guildId,
            ]
        );

        return $row === false ? null : $row;
    }

    /**
     * The guild this deployment is infrastructure for, when there is exactly
     * one.
     *
     * Only used as a default when registering a client, so that a guild running
     * its own webapp does not have to state its own id. A shared, white-labeled
     * webapp has no single answer here and must name the guild explicitly.
     *
     * @throws Exception
     */
    public function findLocalGuildId(): ?string
    {
        $guildId = $this->entityManager->getConnection()->fetchOne(
            '
            SELECT id
            FROM guild_meta
            WHERE this_infrastructure = TRUE
            LIMIT 1
            '
        );

        return $guildId === false || $guildId === null ? null : (string) $guildId;
    }

    /**
     * Claims for the ID token and the userinfo endpoint.
     *
     * `sub` is the chain player ID because MAS turns it into a Matrix
     * localpart, which must never change for a player. The primary address can
     * be rotated on chain, so it is published as descriptive data instead.
     *
     * @param array<string, mixed> $player
     * @param string[]             $scopes
     *
     * @return array<string, mixed>
     */
    public function buildClaims(array $player, array $scopes): array
    {
        $claims = ['sub' => (string) $player['id']];

        if (!in_array(OidcConfig::SCOPE_PROFILE, $scopes, true)) {
            return $claims;
        }

        $username = $this->nonEmpty($player['username'] ?? null);

        if ($username !== null) {
            $claims['preferred_username'] = $username;
            $claims['name'] = $username;
        }

        $pfp = $this->nonEmpty($player['pfp'] ?? null);

        if ($pfp !== null) {
            $claims['picture'] = $pfp;
        }

        $guildId = $this->nonEmpty($player['guild_id'] ?? null);

        if ($guildId !== null) {
            $claims['guild_id'] = $guildId;
        }

        $primaryAddress = $this->nonEmpty($player['primary_address'] ?? null);

        if ($primaryAddress !== null) {
            $claims['primary_address'] = $primaryAddress;
        }

        return $claims;
    }

    private function nonEmpty(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
