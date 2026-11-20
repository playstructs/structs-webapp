<?php

namespace App\Manager;

use App\Query\SectorBlitzPublicQuery;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * The reads behind a raid spectator view. Each one reuses the in-game read, so the spectator
 * map gets exactly the shapes the game's own map is built from. SectorBlitzPublicManager caches
 * the result once per block and planet, so these run once per block however many people watch.
 */
class SectorBlitzSpectateReader
{
    /**
     * Player fields a spectator may see. The in-game read also carries the player's addresses
     * and vault funding, which a spectator view has no use for.
     */
    private const array PLAYER_FIELDS = [
        'id', 'guild_id', 'substation_id', 'planet_id', 'fleet_id', 'fleet', 'username', 'pfp',
        'pfp_client_render_attributes', 'guild_name', 'tag', 'alpha', 'ore', 'load', 'structs_load',
        'capacity', 'connection_capacity',
    ];

    public function __construct(
        private readonly Connection $db,
        private readonly EntityManagerInterface $entityManager,
        private readonly ValidatorInterface $validator,
    ) {
    }

    public function currentHeight(): ?string
    {
        $height = $this->db->fetchOne('SELECT height::text FROM structs.current_block ORDER BY height DESC LIMIT 1');

        return $height === false ? null : (string) $height;
    }

    public function inSectors(string $planetId, array $sectors): bool
    {
        return $this->db->fetchOne('SELECT 1 FROM structs.planet WHERE id = :planet_id AND sector IN (:sectors)',
            ['planet_id' => $planetId, 'sectors' => $sectors], ['sectors' => ArrayParameterType::INTEGER]) !== false;
    }

    /**
     * The raid in progress on a planet in a scoring sector, or null when there is none.
     *
     * @return array{planet_id: string, fleet_id: string, status: string, updated_at: string, fleet_owner: string, planet_owner: ?string}|null
     */
    public function activeRaid(string $planetId, array $sectors): ?array
    {
        $row = $this->db->fetchAssociative(SectorBlitzPublicQuery::SPECTATE_RAID, [
            'planet_id' => $planetId,
            'sectors' => $sectors,
        ], ['sectors' => ArrayParameterType::INTEGER]);

        return $row === false ? null : $row;
    }

    /**
     * Everything the spectator map is built from, for one raid at the current block.
     */
    public function snapshot(array $raid): array
    {
        $planetId = $raid['planet_id'];
        $attackerId = $raid['fleet_owner'];
        $defenderId = $raid['planet_owner'];

        $planets = new PlanetManager($this->entityManager, $this->validator);
        $structs = new StructManager($this->entityManager, $this->validator);
        $fleets = new FleetManager($this->entityManager, $this->validator);

        $attacker = $this->player($attackerId);
        $defender = $defenderId !== null ? $this->player($defenderId) : null;

        return [
            'raid' => [
                'planet_id' => $raid['planet_id'],
                'fleet_id' => $raid['fleet_id'],
                'status' => $raid['status'],
                'updated_at' => $raid['updated_at'],
                'fleet_owner' => $raid['fleet_owner'],
            ],
            'planet' => $this->data($planets->getPlanet($planetId)),
            'shield' => $this->data($planets->getPlanetaryShieldInfo($planetId)),
            'attacker' => [
                'player' => $attacker,
                'fleet' => $this->data($fleets->getFleetByPlayerId($attackerId)),
                'structs' => $this->data($structs->getStructsByPlayerId($attackerId)) ?? [],
                'structs_meta' => $this->meta,
                'last_action_block_height' => $this->lastAction($attackerId),
            ],
            'defender' => $defenderId === null ? null : [
                'player' => $defender,
                'fleet' => $this->data($fleets->getFleetByPlayerId($defenderId)),
                'structs' => $this->data($structs->getStructsByPlayerId($defenderId)) ?? [],
                'structs_meta' => $this->meta,
                'last_action_block_height' => $this->lastAction($defenderId),
            ],
        ];
    }

    /** Every struct type, as the game's /api/struct/type returns them. */
    public function structTypes(): array
    {
        return $this->data((new StructManager($this->entityManager, $this->validator))->getAllStructTypes()) ?? [];
    }

    /** One planet activity row, for resolving a live message too large to be sent in full. */
    public function planetActivityEvent(string $planetId, string $seq, string $time): ?array
    {
        $response = (new TableReadManager($this->entityManager, $this->validator))
            ->planetActivityEvent($planetId, $seq, ['time' => $time]);

        return $this->data($response);
    }

    private function player(string $playerId): ?array
    {
        $player = $this->data((new PlayerManager($this->entityManager, $this->validator))->getPlayer($playerId));
        if (!is_array($player)) {
            return null;
        }

        return array_intersect_key($player, array_flip(self::PLAYER_FIELDS));
    }

    private function lastAction(string $playerId): mixed
    {
        return $this->data((new PlayerManager($this->entityManager, $this->validator))
            ->getPlayerLastActionBlockHeight($playerId));
    }

    /** The meta of the last read, which the game's models keep alongside each struct. */
    private ?array $meta = null;

    private function data(Response $response): mixed
    {
        $this->meta = null;
        if ($response->getStatusCode() !== 200) {
            return null;
        }
        $body = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING);
        $this->meta = is_array($body['meta'] ?? null) ? $body['meta'] : null;

        return ($body['success'] ?? false) ? ($body['data'] ?? null) : null;
    }
}
