<?php

namespace App\Manager;

use App\Constant\FeatureFlags;
use App\Query\SectorBlitzPublicQuery;
use App\Util\ClientKey;
use Doctrine\DBAL\Connection;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Lock\LockFactory;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

/**
 * Reads for the public Sector Blitz leaderboard (/sector-blitz).
 *
 * Anyone can open the page, so its database work must not grow with the number of viewers:
 * - Each response is computed at most once per published scoring build (build id + height)
 *   and shared from the cache by every viewer. Current Battles is computed once per block.
 * - A worker that finds another one already refreshing a slot serves the previous copy.
 * - Responses are public for a few seconds, so a proxy or CDN in front can answer for us.
 * - Requests are rate-limited per client, and cache misses share one global budget.
 */
class SectorBlitzPublicManager
{
    public const array SECTORS = [44, 127, 999];
    public const int PAGE_SIZE = 10;
    public const int BATTLE_PAGE_SIZE = 5;
    public const int MAX_PAGE = 1000;

    /** 14 days of 6 second blocks: how long results stay on display after a contest ends. */
    public const int RESULTS_DISPLAY_BLOCKS = 201600;

    public const string PHASE_NONE = 'none';
    public const string PHASE_ACTIVE = 'active';
    public const string PHASE_RESULTS = 'results';

    /** Guilds sent for the Sector Blitz card's bars and legend. */
    private const int CARD_GUILDS = 100;
    private const int PODIUM_GUILDS = 4;
    private const int PODIUM_PLAYERS = 3;

    /** How long the chain height used for spectator snapshots is trusted. */
    private const int HEIGHT_TTL = 1;
    /** While viewers report a newer block, the chain height is read again at most this often (seconds). */
    private const float HEIGHT_RECHECK = 0.25;
    /** How long a snapshot built ahead of the chain height is shared for its block (seconds). */
    private const float AHEAD_TTL = 1.0;
    /** About one block: how long the current contest and its build are trusted. */
    private const int CURRENT_TTL = 5;
    /** A failed read is retried after this, even if no new build is published. */
    private const int UNAVAILABLE_TTL = 30;
    /** Slots are replaced in place, so this only bounds slots nobody asks for any more. */
    private const int DATA_TTL = 3600;

    private const string CACHE_CONTROL = 'public, max-age=5, s-maxage=10, stale-while-revalidate=30';
    /** Struct types change only with a chain upgrade. */
    private const string STATIC_CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600';
    /** A past planet activity row never changes. */
    private const string IMMUTABLE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=86400, immutable';

    public function __construct(
        private readonly Connection $db,
        private readonly InfluenceManager $influence,
        private readonly CacheItemPoolInterface $sectorBlitzCache,
        private readonly LockFactory $lockFactory,
        private readonly RateLimiterFactoryInterface $sectorBlitzPublicClientLimiter,
        private readonly RateLimiterFactoryInterface $sectorBlitzPublicGlobalLimiter,
        private readonly RequestStack $requestStack,
        private readonly SectorBlitzSpectateReader $spectate,
    ) {
    }

    public static function assertEnabled(): void
    {
        if (!FeatureFlags::SECTOR_BLITZ) {
            throw new NotFoundHttpException();
        }
    }

    /**
     * The contest, its sector standings and the overall guild ranks (for the Sector Blitz card).
     * With a sector after the contest, also that sector's podium.
     */
    public function summary(?int $sector): Response
    {
        return $this->respond(function () use ($sector): array {
            $current = $this->current();
            $empty = ['phase' => $current['phase'], 'contest' => $current['contest'], 'available' => true,
                'standings' => [], 'guilds' => [], 'podium' => null];
            if ($current['contest'] === null) {
                return $empty;
            }

            $withPodium = $sector !== null && $current['phase'] === self::PHASE_RESULTS;
            $slot = 'summary.' . ($withPodium ? $sector : 'all');

            $data = $this->cached($slot, $current['identity'], function () use ($current, $withPodium, $sector): array {
                $cid = $current['contest']['contest_id'];
                $standings = $this->read(fn () => $this->influence->standings($cid));
                $guilds = $this->read(fn () => $this->influence->guildRanks($cid,
                    ['limit' => (string) self::CARD_GUILDS, 'scored_only' => '1']));
                $podiumGuilds = $podiumPlayers = null;
                if ($withPodium) {
                    $podiumGuilds = $this->read(fn () => $this->influence->guildRanks($cid,
                        ['sector' => (string) $sector, 'limit' => (string) self::PODIUM_GUILDS, 'scored_only' => '1']));
                    $podiumPlayers = $this->read(fn () => $this->influence->players($cid,
                        ['sector' => (string) $sector, 'limit' => (string) self::PODIUM_PLAYERS, 'scored_only' => '1']));
                }

                return [
                    'phase' => $current['phase'],
                    'contest' => $current['contest'],
                    'available' => $standings !== null && $guilds !== null
                        && (!$withPodium || ($podiumGuilds !== null && $podiumPlayers !== null)),
                    'standings' => $standings['data'] ?? [],
                    'guilds' => $guilds['data'] ?? [],
                    'podium' => $withPodium
                        ? ['guilds' => $podiumGuilds['data'] ?? [], 'players' => $podiumPlayers['data'] ?? []]
                        : null,
                ];
            });

            // The cached copy is per build; the height (for the time remaining) is per block.
            $data['contest'] = $current['contest'];

            return $data;
        });
    }

    /** One page of Top Guilds: overall (ranked by sectors controlled) or for one sector. */
    public function guilds(?int $sector, int $page): Response
    {
        return $this->respond(fn (): array => $this->leaderboard('guilds', $sector, $page,
            fn (string $cid, array $query) => $this->influence->guildRanks($cid, $query, (string) $page)));
    }

    /** One page of Top Players: overall or for one sector. */
    public function players(?int $sector, int $page): Response
    {
        return $this->respond(fn (): array => $this->leaderboard('players', $sector, $page,
            fn (string $cid, array $query) => $this->influence->players($cid, $query, (string) $page)));
    }

    /** One page of raids in progress in the scoring sectors, only while a contest runs. */
    public function battles(int $page): Response
    {
        return $this->respond(function () use ($page): array {
            $current = $this->current();
            if ($current['phase'] !== self::PHASE_ACTIVE) {
                return ['phase' => $current['phase'], 'available' => true, 'data' => [], 'total' => '0'];
            }

            return $this->cached("battles.{$page}", 'height.' . $current['contest']['height'], function () use ($current, $page): array {
                $params = ['limit' => self::BATTLE_PAGE_SIZE, 'offset' => ($page - 1) * self::BATTLE_PAGE_SIZE];
                $rows = $this->db->fetchAllAssociative(SectorBlitzPublicQuery::BATTLES, $params);
                foreach ($rows as &$row) {
                    $row['defender'] = json_decode($row['defender'], true, 512, JSON_THROW_ON_ERROR);
                    $row['attacker'] = json_decode($row['attacker'], true, 512, JSON_THROW_ON_ERROR);
                }
                unset($row);
                $total = (string) $this->db->fetchOne(SectorBlitzPublicQuery::COUNT_BATTLES);

                return ['phase' => $current['phase'], 'available' => true, 'data' => $rows, 'total' => $total];
            });
        });
    }

    /**
     * Everything a spectator needs to watch one raid in progress, computed once per block for
     * everyone watching it. Only raids on planets in the scoring sectors, while a contest runs.
     * When the raid has ended, 'raid' is null.
     *
     * @param ?int $minHeight the block of the newest live message the viewer has seen. Its
     *     changes must be in the answer, even if the chain height read here has not caught up.
     */
    public function spectate(string $planetId, ?int $minHeight): Response
    {
        return $this->respond(function () use ($planetId, $minHeight): array {
            $current = $this->current();
            if ($current['phase'] !== self::PHASE_ACTIVE) {
                return ['phase' => $current['phase'], 'available' => true, 'height' => $current['contest']['height'] ?? null,
                    'raid' => null];
            }

            [$height, $ahead] = $this->spectateHeight($minHeight);
            $empty = ['phase' => $current['phase'], 'available' => true, 'height' => $height, 'raid' => null];
            // A copy built ahead of the chain height may hold only part of that block: it is
            // shared for that block only briefly, then built again.
            $identity = $ahead
                ? 'ahead:' . $height . ':' . (microtime(true) + self::AHEAD_TTL)
                : 'height:' . $height;

            return $this->cached("spectate.{$planetId}", $identity, function () use ($planetId, $empty): array {
                $raid = $this->spectate->activeRaid($planetId, self::SECTORS);

                return $raid === null ? $empty : array_merge($empty, $this->spectate->snapshot($raid));
            }, fn (array $cached): bool => self::snapshotServes($cached, $height));
        });
    }

    /**
     * Whether a cached spectator snapshot can answer for this block. A copy built for a newer
     * block is just as good; one built ahead of the chain for this same block, only until it lapses.
     */
    private static function snapshotServes(array $cached, string $height): bool
    {
        $cachedHeight = (int) ($cached['data']['height'] ?? 0);
        if ($cachedHeight !== (int) $height) {
            return $cachedHeight > (int) $height;
        }
        $identity = explode(':', (string) $cached['identity']);

        return $identity[0] !== 'ahead' || (float) ($identity[2] ?? 0) > microtime(true);
    }

    /**
     * The block a spectator snapshot is built for, and whether it is ahead of the chain height.
     * The chain height is read at most once a second, or a few times a second while viewers report
     * a newer block. A live message can arrive just before the chain height moves on, so a viewer
     * may be up to one block ahead of it, never more.
     *
     * @return array{0: string, 1: bool}
     * @throws SectorBlitzBusyException when the chain height cannot be read
     */
    private function spectateHeight(?int $minHeight): array
    {
        $item = $this->sectorBlitzCache->getItem('spectate-height');
        $cached = $item->isHit() ? $item->get() : null;
        $height = is_array($cached) ? (string) $cached['height'] : null;
        $readAt = is_array($cached) ? (float) $cached['read_at'] : 0.0;
        $behind = $height !== null && $minHeight !== null && $minHeight > (int) $height;

        if ($height === null || ($behind && microtime(true) - $readAt >= self::HEIGHT_RECHECK)) {
            $height = $this->spectate->currentHeight() ?? $height;
            if ($height === null) {
                throw new SectorBlitzBusyException();
            }
            $item->set(['height' => $height, 'read_at' => microtime(true)])->expiresAfter(self::HEIGHT_TTL);
            $this->sectorBlitzCache->save($item);
        }
        if ($minHeight !== null && $minHeight > (int) $height) {
            return [(string) min($minHeight, (int) $height + 1), true];
        }

        return [$height, false];
    }

    /** Every struct type, for drawing and describing structs on the spectator map. */
    public function structTypes(): Response
    {
        return $this->respond(fn (): array => $this->cached('struct-types', 'all',
            fn (): array => ['available' => true, 'data' => $this->spectate->structTypes()]), self::STATIC_CACHE_CONTROL);
    }

    /**
     * One planet activity row on a planet in a scoring sector. Live messages over 8 KB arrive as
     * a key only, and the spectator view resolves them here.
     */
    public function planetActivityEvent(string $planetId, string $seq, string $time): Response
    {
        return $this->respond(fn (): array => $this->cached('event.' . sha1("{$planetId}.{$seq}.{$time}"), 'final', function () use ($planetId, $seq, $time): array {
            if (!$this->spectate->inSectors($planetId, self::SECTORS)) {
                return ['available' => true, 'data' => null];
            }

            return ['available' => true, 'data' => $this->spectate->planetActivityEvent($planetId, $seq, $time)];
        // A row not found may just not be readable yet: only a found row is kept.
        }, fn (array $cached): bool => ($cached['data']['data'] ?? null) !== null),
            fn (array $data): string => $data['data'] === null ? 'no-store' : self::IMMUTABLE_CACHE_CONTROL);
    }

    /**
     * @param callable(string, array): Response $fetch
     */
    private function leaderboard(string $kind, ?int $sector, int $page, callable $fetch): array
    {
        $current = $this->current();
        if ($current['contest'] === null) {
            return ['phase' => $current['phase'], 'available' => true, 'data' => [], 'total' => '0'];
        }

        $slot = "{$kind}." . ($sector ?? 'all') . ".{$page}";

        return $this->cached($slot, $current['identity'], function () use ($current, $sector, $fetch): array {
            $query = ['limit' => (string) self::PAGE_SIZE, 'include_total' => '1', 'scored_only' => '1'];
            if ($sector !== null) {
                $query['sector'] = (string) $sector;
            }
            $result = $this->read(fn () => $fetch($current['contest']['contest_id'], $query));

            return ['phase' => $current['phase'], 'available' => $result !== null,
                'data' => $result['data'] ?? [], 'total' => (string) ($result['total'] ?? '0')];
        });
    }

    /**
     * The contest on display, from a cache refreshed about once a block.
     *
     * @return array{phase: string, contest: ?array, identity: string}
     */
    private function current(): array
    {
        $item = $this->sectorBlitzCache->getItem('current');
        if ($item->isHit() && is_array($item->get())) {
            return $item->get();
        }

        $row = $this->db->fetchAssociative(SectorBlitzPublicQuery::CURRENT_CONTEST, ['results' => self::RESULTS_DISPLAY_BLOCKS]);
        if ($row === false) {
            $current = ['phase' => self::PHASE_NONE, 'contest' => null, 'identity' => 'none'];
        } else {
            $phase = (int) $row['height'] < (int) $row['end_height'] ? self::PHASE_ACTIVE : self::PHASE_RESULTS;
            $current = [
                'phase' => $phase,
                'contest' => [
                    'contest_id' => $row['contest_id'],
                    'start_height' => $row['start_height'],
                    'end_height' => $row['end_height'],
                    'height' => $row['height'],
                ],
                // The phase can change without a new build (the end block passes with no scoring).
                'identity' => implode('.', [$row['contest_id'], $phase, $row['end_height'], $row['build_id'] ?? 'none',
                    $row['projected_height'] ?? 'none', $row['state'] ?? 'none']),
            ];
        }

        $item->set($current)->expiresAfter(self::CURRENT_TTL);
        $this->sectorBlitzCache->save($item);

        return $current;
    }

    /**
     * Serve a slot computed for this identity, or compute it once for everyone.
     *
     * @param callable(): array $compute returns the payload; 'available' => false is kept only briefly
     * @param ?callable(array): bool $isFresh whether a cached entry can be served; by default, only
     *     one computed for this identity
     */
    private function cached(string $slot, string $identity, callable $compute, ?callable $isFresh = null): array
    {
        $isFresh ??= fn (array $cached): bool => $cached['identity'] === $identity;
        $key = 'slot.' . $slot;
        $cached = $this->get($key);
        if ($cached !== null && $isFresh($cached)) {
            return $cached['data'];
        }

        $lock = $this->lockFactory->createLock('sector-blitz.' . $slot, 30);
        if (!$lock->acquire()) {
            // Another worker is refreshing this slot: the previous copy is at most a build behind.
            if ($cached !== null) {
                return $cached['data'];
            }
            $lock->acquire(true);
        }

        try {
            $cached = $this->get($key);
            if ($cached !== null && $isFresh($cached)) {
                return $cached['data'];
            }
            if (!$this->sectorBlitzPublicGlobalLimiter->create('all')->consume()->isAccepted()) {
                if ($cached !== null) {
                    return $cached['data'];
                }
                throw new SectorBlitzBusyException();
            }

            $data = $compute();
            $item = $this->sectorBlitzCache->getItem($key);
            $item->set(['identity' => $identity, 'data' => $data])
                ->expiresAfter(($data['available'] ?? true) ? self::DATA_TTL : self::UNAVAILABLE_TTL);
            $this->sectorBlitzCache->save($item);

            return $data;
        } finally {
            $lock->release();
        }
    }

    private function get(string $key): ?array
    {
        $item = $this->sectorBlitzCache->getItem($key);
        $value = $item->isHit() ? $item->get() : null;

        return is_array($value) && isset($value['identity']) && is_array($value['data'] ?? null) ? $value : null;
    }

    /**
     * Run one InfluenceManager read; null when it could not answer (e.g. no published build yet).
     *
     * @param callable(): Response $read
     * @return array{data: mixed, total: mixed}|null
     */
    private function read(callable $read): ?array
    {
        $response = $read();
        if ($response->getStatusCode() !== 200) {
            return null;
        }
        $body = json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);
        if (!($body['success'] ?? false)) {
            return null;
        }

        return ['data' => $body['data'] ?? [], 'total' => $body['total'] ?? null];
    }

    /**
     * @param callable(): array $build
     * @param string|callable(array): string $cacheControl the header, or how to choose it from the data
     */
    private function respond(callable $build, string|callable $cacheControl = self::CACHE_CONTROL): Response
    {
        self::assertEnabled();

        $client = ClientKey::fromRequest($this->requestStack->getMainRequest());
        $limit = $this->sectorBlitzPublicClientLimiter->create($client)->consume();
        if (!$limit->isAccepted()) {
            return new JsonResponse(['success' => false, 'errors' => ['rate_limited' => 'Too many requests'], 'data' => null],
                Response::HTTP_TOO_MANY_REQUESTS, [
                    'Retry-After' => (string) max(1, $limit->getRetryAfter()->getTimestamp() - time()),
                    'Cache-Control' => 'no-store',
                ]);
        }

        try {
            $data = $build();
        } catch (SectorBlitzBusyException) {
            return new JsonResponse(['success' => false, 'errors' => ['busy' => 'The leaderboard is busy; try again shortly'], 'data' => null],
                Response::HTTP_SERVICE_UNAVAILABLE, ['Retry-After' => '5', 'Cache-Control' => 'no-store']);
        }

        return new JsonResponse(['success' => true, 'errors' => [], 'data' => $data], Response::HTTP_OK,
            ['Cache-Control' => is_string($cacheControl) ? $cacheControl : $cacheControl($data)]);
    }
}
