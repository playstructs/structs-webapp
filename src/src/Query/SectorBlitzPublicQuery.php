<?php

namespace App\Query;

/** Fixed SQL for the public Sector Blitz leaderboard; request values are always bound parameters. */
final class SectorBlitzPublicQuery
{
    /**
     * The contest the public page shows: the latest running contest, otherwise the contest whose
     * results are still on display (:results blocks after its end), with its published build.
     */
    public const CURRENT_CONTEST = <<<'SQL'
SELECT c.contest_id::text, c.chain_id, c.start_height::text, c.end_height::text, cb.height::text AS height,
 b.build_id::text, b.projected_height::text, b.state
FROM structs.influence_contest c
JOIN structs.current_block cb ON cb.chain=c.chain_id
LEFT JOIN structs.influence_published_build pub ON pub.contest_id=c.contest_id
LEFT JOIN structs.influence_projection_build b ON b.build_id=pub.build_id
WHERE cb.height>=c.start_height AND cb.height<c.end_height+CAST(:results AS bigint)
ORDER BY (cb.height<c.end_height) DESC,
 CASE WHEN cb.height<c.end_height THEN c.start_height ELSE c.end_height END DESC, c.contest_id DESC
LIMIT 1
SQL;

    /**
     * Raids in progress on planets in the scoring sectors, newest first.
     * The planet's owner defends; the raiding fleet's owner attacks.
     */
    public const BATTLES = <<<'SQL'
SELECT pr.planet_id,p.sector::text AS sector,
 jsonb_build_object('player_id',d.id,'username',d.username,'pfp_client_render_attributes',d.pfp_client_render_attributes,
  'guild_id',d.guild_id,'tag',dg.tag)::text AS defender,
 jsonb_build_object('player_id',a.id,'username',a.username,'pfp_client_render_attributes',a.pfp_client_render_attributes,
  'guild_id',a.guild_id,'tag',ag.tag)::text AS attacker
FROM structs.planet_raid pr
JOIN structs.planet p ON p.id=pr.planet_id
JOIN structs.fleet f ON f.id=pr.fleet_id
LEFT JOIN structs.player d ON d.id=p.owner
LEFT JOIN structs.guild_meta dg ON dg.id=d.guild_id
LEFT JOIN structs.player a ON a.id=f.owner
LEFT JOIN structs.guild_meta ag ON ag.id=a.guild_id
WHERE pr.status IN ('initiated','ongoing','shieldsVulnerable') AND p.sector IN (44,127,999)
ORDER BY pr.updated_at DESC, pr.planet_id
LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)
SQL;

    public const COUNT_BATTLES = <<<'SQL'
SELECT count(*)
FROM structs.planet_raid pr
JOIN structs.planet p ON p.id=pr.planet_id
JOIN structs.fleet f ON f.id=pr.fleet_id
WHERE pr.status IN ('initiated','ongoing','shieldsVulnerable') AND p.sector IN (44,127,999)
SQL;
}
