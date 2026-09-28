<?php

namespace App\Manager;

use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use RuntimeException;
use stdClass;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Creates the public Matrix room for a fleet or planet on this guild's
 * homeserver, as @guild-bot, and keeps its owner in step with the chain.
 *
 * Players cannot create these rooms themselves: the homeserver refuses public
 * rooms and aliases from anyone but the bot, because a room v12 creator keeps
 * top power forever. Rooms live on the owner's guild, so a request for an
 * object owned elsewhere is turned away with a pointer to that guild.
 */
class ChatRoomManager
{
    public const string KIND_FLEET = 'fleet';

    public const string KIND_PLANET = 'planet';

    public const int OWNER_POWER = 100;

    private const array ID_PATTERNS = [
        self::KIND_FLEET  => '/^9-[0-9]+$/',
        self::KIND_PLANET => '/^2-[0-9]+$/',
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpClientInterface $httpClient,
        #[Autowire(env: 'MATRIX_SERVER_NAME')]
        private readonly string $serverName,
        #[Autowire(env: 'SYNAPSE_CLIENT_URL')]
        private readonly string $synapseUrl,
        #[Autowire(env: 'GUILD_BOT_TOKEN')]
        private readonly string $botToken,
    ) {
    }

    public function isConfigured(): bool
    {
        return $this->serverName !== '' && $this->synapseUrl !== '' && $this->botToken !== '';
    }

    public static function isValidObject(string $kind, string $id): bool
    {
        $pattern = self::ID_PATTERNS[$kind] ?? null;

        return $pattern !== null && preg_match($pattern, $id) === 1;
    }

    /**
     * The object's owner and the owner's guild, or null when the chain has no
     * such object.
     *
     * @return array{owner: string, owner_guild_id: ?string, owner_guild_endpoint: ?string}|null
     *
     * @throws Exception
     */
    public function findOwner(string $kind, string $id): ?array
    {
        $table = $kind === self::KIND_FLEET ? 'fleet' : 'planet';

        $row = $this->entityManager->getConnection()->fetchAssociative(
            "
            SELECT
              o.owner,
              p.guild_id AS owner_guild_id,
              g.endpoint AS owner_guild_endpoint
            FROM {$table} o
            LEFT JOIN player p ON p.id = o.owner
            LEFT JOIN guild g ON g.id = p.guild_id
            WHERE o.id = :id
            LIMIT 1
            ",
            ['id' => $id]
        );

        return $row === false || $row['owner'] === null ? null : $row;
    }

    /**
     * @throws Exception
     */
    public function findLocalGuildId(): ?string
    {
        $guildId = $this->entityManager->getConnection()->fetchOne(
            'SELECT id FROM guild_meta WHERE this_infrastructure = TRUE LIMIT 1'
        );

        return $guildId === false || $guildId === null ? null : (string) $guildId;
    }

    /**
     * Idempotent: resolves the alias, creates the room only if it is missing,
     * and moves owner power to the current chain owner either way.
     *
     * @return array{room_id: string, alias: string, server_name: string, created: bool}
     *
     * @throws RuntimeException when the homeserver refuses or cannot be reached
     */
    public function ensureRoom(string $kind, string $id, string $ownerPlayerId): array
    {
        $alias = "#{$kind}-{$id}:{$this->serverName}";
        $ownerMxid = "@{$ownerPlayerId}:{$this->serverName}";

        $roomId = $this->resolveAlias($alias);
        $created = false;

        if ($roomId === null) {
            $roomId = $this->createRoom($kind, $id, $ownerPlayerId, $ownerMxid);
            $created = $roomId !== null;
            $roomId ??= $this->resolveAlias($alias);
        }

        if ($roomId === null) {
            throw new RuntimeException("Alias {$alias} neither resolves nor can be created");
        }

        if (!$created) {
            $this->syncOwner($roomId, $ownerMxid);
        }

        return [
            'room_id'     => $roomId,
            'alias'       => $alias,
            'server_name' => $this->serverName,
            'created'     => $created,
        ];
    }

    private function resolveAlias(string $alias): ?string
    {
        [$status, $body] = $this->call('GET', '/directory/room/' . rawurlencode($alias));

        if ($status === 404) {
            return null;
        }

        $this->expectOk($status, $body, 'resolve alias');

        return json_decode($body, true)['room_id'] ?? null;
    }

    /**
     * Returns null when another request created the alias first.
     */
    private function createRoom(string $kind, string $id, string $ownerPlayerId, string $ownerMxid): ?string
    {
        [$name, $topic] = $kind === self::KIND_FLEET
            ? ["Fleet {$id}", "Public fleet chat for {$id} (owner {$ownerPlayerId})"]
            : ["Planet {$id}", "Everything said about planet {$id}."];

        [$status, $body] = $this->call('POST', '/createRoom', [
            'name'                         => $name,
            'topic'                        => $topic,
            'room_alias_name'              => "{$kind}-{$id}",
            'preset'                       => 'public_chat',
            'visibility'                   => 'public',
            'invite'                       => [$ownerMxid],
            'power_level_content_override' => [
                'events_default' => 0,
                'users_default'  => 0,
                'users'          => [$ownerMxid => self::OWNER_POWER],
            ],
        ]);

        if ($status === 400 && (json_decode($body, true)['errcode'] ?? null) === 'M_ROOM_IN_USE') {
            return null;
        }

        $this->expectOk($status, $body, 'create room');

        return json_decode($body, true)['room_id'];
    }

    /**
     * Only the current owner holds owner power. Moderators below it are kept.
     * Rooms the bot does not control (created before this policy) are skipped.
     */
    private function syncOwner(string $roomId, string $ownerMxid): void
    {
        $path = '/rooms/' . rawurlencode($roomId) . '/state/m.room.power_levels';
        [$status, $body] = $this->call('GET', $path);

        if ($status === 403 || $status === 404) {
            return;
        }

        $this->expectOk($status, $body, 'read power levels');

        // Decoded as objects so empty maps go back to Synapse as {} rather than [].
        $powerLevels = json_decode($body);
        $users = (array) ($powerLevels->users ?? new stdClass());
        $synced = array_filter(
            $users,
            fn (int $level, string $user) => $level < self::OWNER_POWER || $user === $ownerMxid,
            ARRAY_FILTER_USE_BOTH
        );
        $synced[$ownerMxid] = self::OWNER_POWER;

        if ($synced == $users) {
            return;
        }

        $powerLevels->users = (object) $synced;
        [$status, $body] = $this->call('PUT', $path, $powerLevels);

        if ($status === 403) {
            return;
        }

        $this->expectOk($status, $body, 'update power levels');

        $this->call('POST', '/rooms/' . rawurlencode($roomId) . '/invite', ['user_id' => $ownerMxid]);
    }

    /**
     * @return array{int, string}
     */
    private function call(string $method, string $path, array|object|null $body = null): array
    {
        $options = ['headers' => ['Authorization' => "Bearer {$this->botToken}"]];

        if ($body !== null) {
            $options['body'] = json_encode($body, JSON_UNESCAPED_SLASHES);
            $options['headers']['Content-Type'] = 'application/json';
        }

        try {
            $response = $this->httpClient->request(
                $method,
                rtrim($this->synapseUrl, '/') . '/_matrix/client/v3' . $path,
                $options
            );

            return [$response->getStatusCode(), $response->getContent(false)];
        } catch (TransportExceptionInterface $exception) {
            throw new RuntimeException("Homeserver unreachable: {$exception->getMessage()}", 0, $exception);
        }
    }

    private function expectOk(int $status, string $body, string $action): void
    {
        if ($status < 200 || $status >= 300) {
            throw new RuntimeException("Homeserver refused to {$action} ({$status}): " . substr($body, 0, 200));
        }
    }
}
