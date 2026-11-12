<?php

namespace App\Query;

/** Fixed SQL over published builds; request values are always bound parameters. */
final class InfluenceQuery
{
    public const CONTEXT = <<<'SQL'
SELECT c.contest_id::text, c.chain_id, c.start_height::text, c.end_height::text,
 c.rule_id::text, c.scoring_mode, r.win_points::text, r.claim_points::text,
 r.policy::text, b.build_id::text, b.projected_height::text, b.state,
 cur.coverage_start::text, cur.height::text AS source_height,
 (c.scoring_mode='single_sector' OR NOT EXISTS (
   SELECT 1 FROM structs.influence_contest_planet cp WHERE cp.build_id=b.build_id AND cp.sector=0
 )) AS sectors_complete,
 CASE WHEN rc.refreshed_revision=b.build_id AND rc.complete_before_height<=b.projected_height+1
   THEN rc.complete_before_height ELSE 0 END::text AS complete_before_height
FROM structs.influence_contest c
JOIN structs.influence_rule_set r USING(rule_id)
LEFT JOIN structs.influence_published_build pub USING(contest_id)
LEFT JOIN structs.influence_projection_build b ON b.build_id=pub.build_id
LEFT JOIN structs.influence_source_cursor cur ON cur.chain_id=c.chain_id
LEFT JOIN structs.influence_rollup_coverage rc ON rc.build_id=b.build_id
SQL;

    public const STANDINGS = <<<'SQL'
WITH roster AS (
 SELECT guild FROM structs.influence_member WHERE build_id=:build AND guild IS NOT NULL
 UNION SELECT guild FROM structs.influence_guild_sector WHERE build_id=:build
), components AS (
 SELECT g.guild AS guild_id, sec.value::smallint AS sector,
 coalesce(s.unique_planets,0) AS unique_planets, coalesce(s.held_planets,0) AS held_planets,
 coalesce(s.unique_planets,0)::numeric*CAST(:win AS integer)
 +coalesce(s.held_planets,0)::numeric*CAST(:claim AS integer) AS points
 FROM roster g CROSS JOIN jsonb_array_elements_text(CAST(:sectors AS jsonb)) sec
 LEFT JOIN structs.influence_guild_sector s ON s.build_id=:build AND s.guild=g.guild AND s.sector=sec.value::smallint
), totals AS (
 SELECT *,sum(points) OVER(PARTITION BY guild_id) AS overall_points FROM components
), ranked AS (
 SELECT *,dense_rank() OVER(PARTITION BY sector ORDER BY points DESC,overall_points DESC) AS sector_rank FROM totals
)
SELECT guild_id,sector,unique_planets::text,held_planets::text,points::text,overall_points::text,sector_rank::text,
 (points>0 AND sector_rank=1 AND count(*) FILTER(WHERE sector_rank=1) OVER(PARTITION BY sector)>1) AS tied_for_lead,
 (CAST(:final AS boolean) AND points>0 AND sector_rank=1) AS is_winner
FROM ranked ORDER BY sector,sector_rank,guild_id LIMIT 10001
SQL;

    /** Page members BEFORE counting their wins; no all-player score scan or per-player round trips. */
    public static function players(string $filters, int $limit, int $offset): string
    {
        return <<<SQL
WITH selected AS MATERIALIZED (
 SELECT player,guild FROM structs.influence_member WHERE build_id=:build {$filters}
 ORDER BY player LIMIT {$limit} OFFSET {$offset}
), wins AS (
 SELECT w.player,count(*) AS n FROM selected m
 JOIN structs.influence_player_planet_win w ON w.build_id=:build AND w.player=m.player
 JOIN structs.influence_contest_planet p ON p.build_id=w.build_id AND p.planet=w.planet
 WHERE (CAST(:sector AS smallint) IS NULL OR p.sector=:sector) GROUP BY w.player
), claims AS (
 SELECT s.player,sum(s.held_planets) AS n FROM selected m
 JOIN structs.influence_player_sector s ON s.build_id=:build AND s.player=m.player
 WHERE (CAST(:sector AS smallint) IS NULL OR s.sector=:sector) GROUP BY s.player
)
SELECT m.player AS player_id,m.guild AS guild_id,coalesce(w.n,0)::text AS unique_planets,
 coalesce(c.n,0)::text AS held_planets,
 (coalesce(w.n,0)::numeric*CAST(:win AS integer)+coalesce(c.n,0)::numeric*CAST(:claim AS integer))::text AS points
FROM selected m LEFT JOIN wins w USING(player) LEFT JOIN claims c USING(player) ORDER BY m.player
SQL;
    }

    /** Same payload as influence_grass_planet, using only the webapp's SELECT grants.
     * Bounded index lookups: no raid-history scan and no per-planet API/DB round trips.
     * Guard the aggregate before producing JSON; never return truncated coverage.
     */
    public const PLANETS = <<<'SQL'
WITH selected AS MATERIALIZED (
 SELECT value AS planet,ordinality FROM jsonb_array_elements_text(CAST(:planets AS jsonb)) WITH ORDINALITY
), coverage AS MATERIALIZED (
 SELECT s.planet,w.guild,w.supporter_count FROM selected s CROSS JOIN LATERAL (
  SELECT guild,supporter_count FROM structs.influence_guild_planet_win
  WHERE build_id=:build AND planet=s.planet LIMIT 10001
 ) w LIMIT 10001
), budget AS (SELECT count(*)<=10000 AS within_budget FROM coverage)
SELECT budget.within_budget,CASE WHEN budget.within_budget THEN jsonb_build_object(
 'planet_id',s.planet,'exists',c.planet IS NOT NULL,'sector',c.sector,'holder',c.holder,
 'holder_guild_id',m.guild,'latest_raid',CASE WHEN r.raid_id IS NULL THEN NULL ELSE jsonb_build_object(
 'raid_id',r.raid_id::text,'height',r.height::text,'attacker',r.attacker,'defender',r.defender,
 'attacker_guild',r.attacker_guild,'defender_guild',r.defender_guild,'source_sector',r.sector) END,
 'guild_coverage',coalesce((SELECT jsonb_agg(jsonb_build_object(
  'guild_id',guild,'supporter_count',supporter_count::text) ORDER BY guild)
  FROM coverage WHERE planet=s.planet),'[]'::jsonb)) END::text AS planet
FROM selected s CROSS JOIN budget
LEFT JOIN structs.influence_planet_claim c ON c.build_id=:build AND c.planet=s.planet
LEFT JOIN structs.influence_member m ON m.build_id=:build AND m.player=c.holder
LEFT JOIN structs.influence_raid r ON r.raid_id=c.latest_raid_id
ORDER BY s.ordinality
SQL;

    /**
     * One pass over the height hypertable, grouped in SQL by the requested labels.
     * Raw deltas cover [contest_start, roll_lo) and [roll_hi, end]; verified
     * 1000-height rollups cover [roll_lo, roll_hi). The caller opens a rollup span
     * only where each bucket falls inside a single bin, so every source row lands
     * in exactly one bin. Bin -1 is the opening balance at start-1.
     */
    public const GUILD_HISTORY = <<<'SQL'
SELECT CASE WHEN CAST(:by_guild AS boolean) THEN guild END AS guild_id,sector,
 CASE WHEN h<CAST(:start AS bigint) THEN -1
  ELSE ((h-CAST(:start AS bigint))/CAST(:bucket AS bigint))::int END AS bin,
 sum(u)::text AS unique_delta,sum(c)::text AS claim_delta
FROM (
 SELECT guild,sector,height AS h,unique_delta AS u,claim_delta AS c FROM structs.influence_score_change
 WHERE build_id=:build AND height BETWEEN CAST(:contest_start AS bigint) AND CAST(:roll_lo AS bigint)-1
 AND (CAST(:guild AS text) IS NULL OR guild=:guild) AND (CAST(:sector AS smallint) IS NULL OR sector=:sector)
 UNION ALL
 SELECT guild,sector,bucket,unique_delta,claim_delta FROM structs.influence_score_change_1000
 WHERE build_id=:build AND bucket>=CAST(:roll_lo AS bigint) AND bucket<CAST(:roll_hi AS bigint)
 AND (CAST(:guild AS text) IS NULL OR guild=:guild) AND (CAST(:sector AS smallint) IS NULL OR sector=:sector)
 UNION ALL
 SELECT guild,sector,height,unique_delta,claim_delta FROM structs.influence_score_change
 WHERE build_id=:build AND height BETWEEN CAST(:roll_hi AS bigint) AND CAST(:end AS bigint)
 AND (CAST(:guild AS text) IS NULL OR guild=:guild) AND (CAST(:sector AS smallint) IS NULL OR sector=:sector)
) d
GROUP BY 1,2,3
SQL;

    /**
     * Personal wins are not guild deltas. The projector maintains them per block in
     * influence_player_score_change, so this is one index range for one player.
     */
    public const PLAYER_HISTORY = <<<'SQL'
SELECT sector,
 CASE WHEN height<CAST(:start AS bigint) THEN -1
  ELSE ((height-CAST(:start AS bigint))/CAST(:bucket AS bigint))::int END AS bin,
 sum(unique_delta)::text AS unique_delta,sum(claim_delta)::text AS claim_delta
FROM structs.influence_player_score_change
WHERE build_id=:build AND player=:player
AND height BETWEEN CAST(:contest_start AS bigint) AND CAST(:end AS bigint)
AND (CAST(:sector AS smallint) IS NULL OR sector=:sector)
GROUP BY 1,2
SQL;
}
