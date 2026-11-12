<?php

namespace App\Manager;

use App\Dto\ApiResponseContentDto;
use App\Query\InfluenceQuery;
use App\Util\ConsistentRead;
use App\Util\InfluenceParameters as P;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception\DriverException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/** Read-only contest APIs. Every multi-query response pins one published build. */
class InfluenceManager
{
    public function __construct(private readonly Connection $db) {}

    public function contests(array $query, string $page = '1'): Response
    {
        return $this->respond(function ($body) use ($query, $page): void {
            P::only($query, ['limit', 'after_id', 'include_total', 'chain_id']);
            [$page, $limit, $offset, $total] = P::page($query, $page);
            $filters = []; $params = [];
            if (isset($query['chain_id'])) {
                if (!preg_match('/\A[a-zA-Z0-9_-]{1,100}\z/', (string) $query['chain_id'])) {
                    throw new BadRequestHttpException('Invalid chain_id');
                }
                $filters[] = 'c.chain_id=:chain'; $params['chain'] = $query['chain_id'];
            }
            if (isset($query['after_id'])) {
                $filters[] = 'c.contest_id>:after'; $params['after'] = P::integer($query['after_id'], 'after_id', 1);
            }
            $where = $filters ? ' WHERE ' . implode(' AND ', $filters) : '';
            $this->snapshot(function () use ($body, $params, $where, $page, $limit, $offset, $total): void {
                $rows = $this->db->fetchAllAssociative(InfluenceQuery::CONTEXT . $where . ' ORDER BY c.contest_id LIMIT ' . ($limit + 1) . " OFFSET {$offset}", $params);
                $body->meta = $this->paging($rows, $page, $limit, 'contest_id');
                $body->data = array_map(fn ($c) => $this->describe($c), $rows);
                if ($total) $body->total = (string) $this->db->fetchOne('SELECT count(*) FROM structs.influence_contest c' . $where, $params);
            });
        });
    }

    public function contest(string $contest, array $query = []): Response
    {
        return $this->respond(function ($body) use ($contest, $query): void {
            P::only($query, []); $cid = P::integer($contest, 'contest_id', 1);
            $this->snapshot(function () use ($body, $cid): void {
                $body->data = $this->context($cid, $body);
            });
        });
    }

    public function standings(string $contest, array $query = []): Response
    {
        return $this->respond(function ($body) use ($contest, $query): void {
            P::only($query, ['sector']); $cid = P::integer($contest, 'contest_id', 1); $sector = P::sector($query);
            $this->snapshot(function () use ($body, $cid, $sector): void {
                $c = $this->context($cid, $body); $this->validateSector($c, $sector);
                $body->data = array_values(array_filter($this->standingsRows($c), fn ($r) => $sector === null || $r['sector'] === $sector));
                $body->meta['score_kind'] = 'guild';
            });
        });
    }

    public function guild(string $contest, string $guild, array $query = []): Response
    {
        return $this->respond(function ($body) use ($contest, $guild, $query): void {
            P::only($query, ['sector']); $cid = P::integer($contest, 'contest_id', 1);
            $guild = P::objectId($guild, 'guild'); $sector = P::sector($query);
            $this->snapshot(function () use ($body, $cid, $guild, $sector): void {
                $c = $this->context($cid, $body); $this->validateSector($c, $sector); $this->requireGuild($c, $guild);
                $all = array_values(array_filter($this->standingsRows($c), fn ($r) => $r['guild_id'] === $guild));
                $rows = array_values(array_filter($all, fn ($r) => $sector === null || $r['sector'] === $sector));
                $body->data = ['guild_id' => $guild, 'sector' => $sector] + $this->sumScores($rows, $c)
                    + ['overall_points' => $this->sumScores($all, $c)['points'], 'sectors' => $rows];
                $body->meta['score_kind'] = 'guild';
            });
        });
    }

    public function players(string $contest, array $query = [], string $page = '1'): Response
    {
        return $this->respond(function ($body) use ($contest, $query, $page): void {
            P::only($query, ['limit', 'after_id', 'include_total', 'guild_id', 'sector']);
            $cid = P::integer($contest, 'contest_id', 1); $sector = P::sector($query);
            [$page, $limit, $offset, $total] = P::page($query, $page);
            $guild = isset($query['guild_id']) ? P::objectId($query['guild_id'], 'guild') : null;
            $after = isset($query['after_id']) ? P::objectId($query['after_id'], 'player') : null;
            $this->snapshot(function () use ($body, $cid, $sector, $guild, $after, $page, $limit, $offset, $total): void {
                $c = $this->context($cid, $body); $this->validateSector($c, $sector);
                $params = $this->scoreParams($c) + ['sector' => $sector]; $filter = '';
                if ($guild !== null) { $this->requireGuild($c, $guild); $filter .= ' AND guild=:guild'; $params['guild'] = $guild; }
                if ($after !== null) { $filter .= ' AND player>:after'; $params['after'] = $after; }
                $rows = $this->db->fetchAllAssociative(InfluenceQuery::players($filter, $limit + 1, $offset), $params);
                $body->meta += $this->paging($rows, $page, $limit, 'player_id');
                $body->meta += ['score_kind' => 'personal', 'additive_to_guild' => false, 'sector' => $sector];
                $body->data = $rows;
                if ($total) {
                    $cp = ['build' => $c['build_id']]; if ($guild !== null) $cp['guild'] = $guild;
                    if ($after !== null) $cp['after'] = $after;
                    $body->total = (string) $this->db->fetchOne('SELECT count(*) FROM structs.influence_member WHERE build_id=:build' . $filter, $cp);
                }
            });
        });
    }

    public function player(string $contest, string $player, array $query = []): Response
    {
        return $this->respond(function ($body) use ($contest, $player, $query): void {
            P::only($query, ['sector']); $cid = P::integer($contest, 'contest_id', 1);
            $player = P::objectId($player, 'player'); $sector = P::sector($query);
            $this->snapshot(function () use ($body, $cid, $player, $sector): void {
                $c = $this->context($cid, $body); $this->validateSector($c, $sector);
                $member = $this->requirePlayer($c, $player);
                $rows = $this->db->fetchAllAssociative(<<<'SQL'
WITH wins AS (
 SELECT cp.sector,count(*) AS n FROM structs.influence_player_planet_win w
 JOIN structs.influence_contest_planet cp ON cp.build_id=w.build_id AND cp.planet=w.planet
 WHERE w.build_id=:build AND w.player=:player GROUP BY cp.sector
)
SELECT s.value::smallint AS sector,coalesce(w.n,0)::text AS unique_planets,coalesce(p.held_planets,0)::text AS held_planets,
 (coalesce(w.n,0)::numeric*CAST(:win AS integer)+coalesce(p.held_planets,0)::numeric*CAST(:claim AS integer))::text AS points
FROM jsonb_array_elements_text(CAST(:sectors AS jsonb)) s LEFT JOIN wins w ON w.sector=s.value::smallint
LEFT JOIN structs.influence_player_sector p ON p.build_id=:build AND p.player=:player AND p.sector=s.value::smallint
ORDER BY sector
SQL, $this->scoreParams($c) + ['player' => $player, 'sectors' => json_encode($c['sectors'])]);
                foreach ($rows as &$r) $r['sector'] = (int) $r['sector']; unset($r);
                $selected = array_values(array_filter($rows, fn ($r) => $sector === null || $r['sector'] === $sector));
                $body->data = ['player_id' => $player, 'guild_id' => $member['guild'], 'sector' => $sector]
                    + $this->sumScores($selected, $c)
                    + ['overall_points' => $this->sumScores($rows, $c)['points'], 'sectors' => $selected];
                $body->meta += ['score_kind' => 'personal', 'additive_to_guild' => false];
            });
        });
    }

    public function history(string $contest, string $kind, ?string $id, array $query): Response
    {
        return $this->respond(function ($body) use ($contest, $kind, $id, $query): void {
            P::only($query, ['start_height', 'end_height', 'bucket_blocks', 'sector', 'group_by']);
            if (!in_array($kind, ['contest', 'guild', 'player'], true)) throw new BadRequestHttpException('Invalid history scope');
            $cid = P::integer($contest, 'contest_id', 1); $sector = P::sector($query);
            if ($kind !== 'contest') $id = P::objectId($id, $kind);
            $start = P::integer($query['start_height'] ?? null, 'start_height', 1);
            $end = P::integer($query['end_height'] ?? null, 'end_height', 1);
            if ($end < $start || $end - $start >= P::MAX_RANGE) throw new BadRequestHttpException('Inclusive range must contain 1 to 1000000 blocks');
            $bucket = P::integer($query['bucket_blocks'] ?? '1000', 'bucket_blocks', 1, P::MAX_RANGE);
            if (intdiv($end - $start, $bucket) + 1 > P::MAX_SAMPLES) throw new BadRequestHttpException('Too many samples; increase bucket_blocks (maximum 1000 samples per series)');
            $group = $query['group_by'] ?? 'total';
            $allowed = $kind === 'contest' ? ['total', 'sector', 'guild', 'guild_sector'] : ['total', 'sector'];
            if (!in_array($group, $allowed, true)) throw new BadRequestHttpException('Unsupported group_by for this scope');
            $bins = [];
            for ($lo = $start, $i = 0; $lo <= $end; $i++) {
                $hi = $lo + min($bucket - 1, $end - $lo); $bins[] = ['bin' => $i, 'lo' => $lo, 'hi' => $hi]; $lo = $hi + 1;
            }
            $this->snapshot(function () use ($body, $cid, $kind, $id, $sector, $group, $start, $end, $bucket, $bins): void {
                $c = $this->context($cid, $body); $this->validateSector($c, $sector);
                if ($start < (int) $c['start_height'] || $end > (int) $c['end_height'] || $end > (int) $c['projected_height']) {
                    throw new HttpException(422, 'Range must be inside this contest and no later than its projected_height');
                }
                if ($kind === 'guild') $this->requireGuild($c, $id);
                if ($kind === 'player') $this->requirePlayer($c, $id);
                $sectors = $sector === null ? $c['sectors'] : [$sector];
                $guilds = [null];
                if ($kind === 'guild') $guilds = [$id];
                elseif (in_array($group, ['guild', 'guild_sector'], true)) $guilds = $this->guilds($c);
                $groups = [];
                foreach ($guilds as $g) foreach ($sectors as $s) {
                    $labels = $this->labels($kind, $id, $group, $sector, $g, $s);
                    $groups[json_encode($labels)] = $labels;
                }
                if (count($groups) * (count($bins) + 1) > P::MAX_ROWS) throw new HttpException(422, 'History exceeds 10000 rows; narrow the scope or increase bucket_blocks');
                $params = ['build' => $c['build_id'], 'sector' => $sector, 'contest_start' => $c['start_height'], 'start' => $start];
                if ($kind === 'player') {
                    $rows = $this->db->fetchAllAssociative(InfluenceQuery::PLAYER_HISTORY, $params + ['chain' => $c['chain_id'], 'player' => $id, 'end' => $end, 'bucket' => $bucket]);
                } else {
                    $rows = $this->db->fetchAllAssociative(InfluenceQuery::GUILD_HISTORY, $params + ['guild' => $kind === 'guild' ? $id : null, 'marker' => $c['complete_before_height'], 'bins' => json_encode($bins)]);
                }
                $body->data = $this->chart($rows, $groups, $bins, $c, $kind, $id, $group, $sector);
                $body->meta += ['score_kind' => $kind === 'player' ? 'personal' : 'guild', 'additive_to_guild' => $kind !== 'player',
                    'group_by' => $group, 'sector' => $sector, 'start_height' => (string) $start, 'end_height' => (string) $end,
                    'opening_height' => (string) ($start - 1), 'bucket_blocks' => (string) $bucket,
                    'range_semantics' => 'inclusive_contest_balances', 'rollup_complete_before_height' => $kind === 'player' ? null : $c['complete_before_height']];
            });
        });
    }

    private function chart(array $rows, array $groups, array $bins, array $c, string $kind, ?string $id, string $group, ?int $sector): array
    {
        $changes = [];
        foreach ($rows as $row) {
            $key = json_encode($this->labels($kind, $id, $group, $sector, $row['guild_id'] ?? null, (int) $row['sector']));
            $bin = (int) $row['bin']; $v = $changes[$key][$bin] ?? ['0', '0'];
            $changes[$key][$bin] = [bcadd($v[0], $row['unique_delta'], 0), bcadd($v[1], $row['claim_delta'], 0)];
        }
        $opening = []; $samples = [];
        foreach ($groups as $key => $labels) {
            [$u, $h] = $changes[$key][-1] ?? ['0', '0'];
            $opening[] = $labels + $this->counts($u, $h, $c);
            foreach ($bins as $b) {
                [$du, $dh] = $changes[$key][$b['bin']] ?? ['0', '0'];
                $u = bcadd($u, $du, 0); $h = bcadd($h, $dh, 0);
                $samples[] = $labels + ['start_height' => (string) $b['lo'], 'height' => (string) $b['hi']]
                    + $this->counts($u, $h, $c) + ['unique_delta' => $du, 'claim_delta' => $dh, 'points_delta' => $this->points($du, $dh, $c)];
            }
        }
        return ['opening' => $opening, 'samples' => $samples];
    }

    private function labels(string $kind, ?string $id, string $group, ?int $sector, ?string $guild, int $area): array
    {
        $labels = [];
        if ($kind === 'player') $labels['player_id'] = $id;
        if ($kind === 'guild' || in_array($group, ['guild', 'guild_sector'], true)) $labels['guild_id'] = $guild;
        if ($sector !== null || in_array($group, ['sector', 'guild_sector'], true)) $labels['sector'] = $area;
        return $labels;
    }

    private function context(int $cid, ApiResponseContentDto $body): array
    {
        $row = $this->db->fetchAssociative(InfluenceQuery::CONTEXT . ' WHERE c.contest_id=:id', ['id' => $cid]);
        if ($row === false) throw new NotFoundHttpException('Contest not found');
        $c = $this->describe($row);
        $body->meta = ['api_contract' => 'structs-influence-v1', 'contest_id' => $c['contest_id'], 'chain_id' => $c['chain_id'], 'build_id' => $c['build_id'],
            'height' => $c['projected_height'], 'projected_height' => $c['projected_height'], 'source_height' => $c['source_height'],
            'coverage_start' => $c['coverage_start'], 'contest_start_height' => $c['start_height'], 'contest_end_height' => $c['end_height'],
            'state' => $c['state'], 'status' => $c['status'], 'data_ready' => $c['data_ready'],
            'scoring_mode' => $c['scoring_mode'], 'sectors_complete' => $c['sectors_complete'], 'sectors' => $c['sectors'],
            'rule_id' => $c['rule_id'], 'win_points' => $c['win_points'], 'claim_points' => $c['claim_points']];
        if (!$c['data_ready']) throw new HttpException(503, 'Contest has no complete published scoring snapshot');
        return $c;
    }

    private function describe(array $c): array
    {
        $c['sectors_complete'] = self::boolean($c['sectors_complete']);
        $c['policy'] = json_decode($c['policy'], true, 512, JSON_THROW_ON_ERROR);
        $c['data_ready'] = $c['build_id'] !== null && in_array($c['state'], ['live', 'final'], true)
            && $c['source_height'] !== null && (int) $c['projected_height'] <= (int) $c['source_height']
            && (int) $c['start_height'] >= (int) $c['coverage_start'];
        $c['status'] = !$c['data_ready'] ? 'unavailable' : ($c['state'] === 'final' ? 'final'
            : ((int) $c['projected_height'] < (int) $c['start_height'] ? 'scheduled'
            : ((int) $c['projected_height'] >= (int) $c['end_height'] ? 'awaiting_sectors' : 'active')));
        $c['sectors'] = $c['scoring_mode'] === 'single_sector' ? [0] : ($c['sectors_complete'] ? [44, 127, 999] : [0, 44, 127, 999]);
        return $c;
    }

    private function standingsRows(array $c): array
    {
        $rows = $this->db->fetchAllAssociative(InfluenceQuery::STANDINGS, $this->scoreParams($c) + [
            'sectors' => json_encode($c['sectors']), 'final' => $c['state'] === 'final' && $c['sectors_complete'] ? 'true' : 'false']);
        if (count($rows) > P::MAX_ROWS) throw new HttpException(422, 'Standings exceed maximum response size');
        foreach ($rows as &$r) {
            $r['sector'] = (int) $r['sector']; $r['tied_for_lead'] = self::boolean($r['tied_for_lead']); $r['is_winner'] = self::boolean($r['is_winner']);
        }
        return $rows;
    }

    private function guilds(array $c): array
    {
        $rows = $this->db->fetchFirstColumn('SELECT guild FROM structs.influence_member WHERE build_id=:build AND guild IS NOT NULL
            UNION SELECT guild FROM structs.influence_guild_sector WHERE build_id=:build ORDER BY guild LIMIT 10001', ['build' => $c['build_id']]);
        if (count($rows) > P::MAX_ROWS) throw new HttpException(422, 'Too many guilds; request one guild');
        return $rows;
    }

    private function requireGuild(array $c, string $guild): void
    {
        $found = $this->db->fetchOne('SELECT EXISTS(SELECT 1 FROM structs.influence_member WHERE build_id=:build AND guild=:guild)
            OR EXISTS(SELECT 1 FROM structs.influence_guild_sector WHERE build_id=:build AND guild=:guild)', ['build' => $c['build_id'], 'guild' => $guild]);
        if (!self::boolean($found)) throw new NotFoundHttpException('Guild not present in this contest');
    }

    private function requirePlayer(array $c, string $player): array
    {
        $row = $this->db->fetchAssociative('SELECT guild FROM structs.influence_member WHERE build_id=:build AND player=:player', ['build' => $c['build_id'], 'player' => $player]);
        if ($row === false) throw new NotFoundHttpException('Player not present in this contest');
        return $row;
    }

    private function validateSector(array $c, ?int $sector): void
    {
        if ($sector !== null && $c['scoring_mode'] === 'single_sector' && $sector !== 0) throw new BadRequestHttpException('Single-sector contests use sector 0 (all planets)');
    }

    private function scoreParams(array $c): array { return ['build' => $c['build_id'], 'win' => $c['win_points'], 'claim' => $c['claim_points']]; }
    private static function boolean(mixed $v): bool { return in_array($v, [true, 1, '1', 't', 'true'], true); }
    private function points(string $u, string $h, array $c): string { return bcadd(bcmul($u, $c['win_points'], 0), bcmul($h, $c['claim_points'], 0), 0); }
    private function counts(string $u, string $h, array $c): array { return ['unique_planets' => $u, 'held_planets' => $h, 'points' => $this->points($u, $h, $c)]; }
    private function sumScores(array $rows, array $c): array
    {
        $u = '0'; $h = '0';
        foreach ($rows as $r) { $u = bcadd($u, $r['unique_planets'], 0); $h = bcadd($h, $r['held_planets'], 0); }
        return $this->counts($u, $h, $c);
    }

    private function paging(array &$rows, int $page, int $limit, string $id): array
    {
        $more = count($rows) > $limit; if ($more) array_pop($rows);
        return ['page' => $page, 'limit' => $limit, 'has_more' => $more,
            'next_after_id' => $more && $rows ? $rows[array_key_last($rows)][$id] : null];
    }

    private function snapshot(callable $read): void
    {
        ConsistentRead::run($this->db, function () use ($read): void {
            $this->db->executeStatement("SET LOCAL statement_timeout='5s'");
            $read();
        });
    }

    private function respond(callable $read): Response
    {
        $body = new ApiResponseContentDto(); $status = 200;
        try { $read($body); $body->success = true; }
        catch (HttpException $error) { $body->data = null; $body->total = null; $body->errors = ['influence_error' => $error->getMessage()]; $status = $error->getStatusCode(); }
        catch (DriverException $error) {
            if (!in_array($error->getSQLState(), ['57014', '42P01', '42703'], true)) throw $error;
            $status = 503;
            $body->data = null; $body->total = null;
            $body->errors = ['influence_unavailable' => $error->getSQLState() === '57014'
                ? 'History read exceeded its query budget; narrow the range or scope' : 'Influence schema is not available'];
        }
        return new JsonResponse($body, $status, ['Cache-Control' => 'private, no-store']);
    }
}
