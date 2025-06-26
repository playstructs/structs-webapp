<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GuildManager
{
    use ApiSqlQueryTrait;

    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    public function __construct(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->validator = $validator;
        $this->constraintViolationUtil = new ConstraintViolationUtil();
        $this->apiRequestParsingManager = new ApiRequestParsingManager(
            $this->validator,
            $this->constraintViolationUtil
        );
    }

    /**
     * @return Response
     * @throws Exception
     */
    public function getGuildFilterList(): Response
    {
        $query = '
            SELECT
              g.id,
              gm.name
            FROM guild g
            LEFT JOIN guild_meta gm
              ON g.id = gm.id
            INNER JOIN player p
              ON g.id = p.guild_id
            GROUP BY g.id, gm.name
            ORDER BY gm.name, g.id;
        ';

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function getGuildName(string $guild_id): Response
    {
        $query = '
            SELECT name
            FROM guild_meta
            WHERE id = :guild_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function countGuildMembers(string $guild_id): Response
    {
        $query = '
            SELECT count(id) AS "count"
            FROM player
            WHERE guild_id = :guild_id;
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @return Response
     * @throws Exception
     */
    public function countGuilds(): Response
    {
        $query = '
            SELECT count(*)
            FROM guild;
        ';

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function getGuild(string $guild_id): Response
    {
        $query = '
            SELECT
              g.id,
              g.endpoint,
              g.join_infusion_minimum,
              g.join_infusion_minimum_bypass_by_request,
              g.join_infusion_minimum_bypass_by_invite,
              g.primary_reactor_id,
              g.entry_substation_id,
              g.creator,
              g.owner,
              gm.name,
              gm.description,
              gm.tag,
              gm.logo,
              gm.socials,
              gm.website,
              gm.this_infrastructure,
              gm.status,
              r.default_commission,
              (
                SELECT "value" 
                FROM setting 
                WHERE name = \'REACTOR_RATIO\'
                LIMIT 1
              ) AS reactor_ratio
            FROM guild g 
            INNER JOIN reactor r
              ON g.primary_reactor_id = r.id
            LEFT JOIN guild_meta gm
              ON g.id = gm.id
            WHERE g.id = :guild_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function getGuildPowerStats(string $guild_id): Response
    {
        $query = '
          SELECT
            p.guild_id,
            sum(COALESCE(i.fuel, 0)) as total_fuel,
            sum(COALESCE(vp.total_load, 0)) as total_load,
            sum(COALESCE(vp.total_capacity, 0)) as total_capacity,
            floor(avg(COALESCE(vp.connection_capacity, 0))) as avg_connection_capacity
          FROM player p
          LEFT JOIN view.player vp
            ON vp.player_id = p.id
          INNER JOIN guild g
            ON p.guild_id = g.id
          INNER JOIN reactor r
            ON g.primary_reactor_id = r.id
          LEFT JOIN infusion i
            ON g.primary_reactor_id = i.destination_id
            AND p.id = i.player_id
            AND i.destination_type = \'reactor\'
          WHERE p.guild_id = :guild_id
          GROUP BY p.guild_id, r.default_commission
          LIMIT 1
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function countGuildPlanetsCompleted(string $guild_id): Response
    {
        $query = '
            SELECT count(1) 
            FROM planet
            INNER JOIN player
              ON player.id = planet.owner
            WHERE planet.status = \'complete\' 
            AND player.guild_id = :guild_id;
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $guild_id
     * @return Response
     * @throws Exception
     */
    public function getGuildRoster(string $guild_id): Response
    {
        $query = '
            SELECT
              p.id,
              p.guild_id,
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              SUM(COALESCE(vpi.balance, 0)) as alpha
            FROM player p
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
            LEFT JOIN view.player_inventory vpi
              ON p.id = vpi.player_id
            WHERE p.guild_id = :guild_id
            GROUP BY
              p.id,
              p.guild_id,
              pm.username,
              pm.pfp,
              guild_name,
              gm.tag
            ORDER BY username;
        ';

        $requestParams = [ApiParameters::GUILD_ID => $guild_id];
        $requiredFields = [ApiParameters::GUILD_ID];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @return Response
     * @throws Exception
     */
    public function getThisGuild(): Response
    {
        $query = '
            SELECT
              g.id,
              g.endpoint,
              g.join_infusion_minimum,
              g.join_infusion_minimum_bypass_by_request,
              g.join_infusion_minimum_bypass_by_invite,
              g.primary_reactor_id,
              g.entry_substation_id,
              g.creator,
              g.owner,
              gm.name,
              gm.description,
              gm.tag,
              gm.logo,
              gm.socials,
              gm.website,
              gm.this_infrastructure,
              gm.status,
              r.default_commission,
              (
                SELECT "value" 
                FROM setting 
                WHERE name = \'REACTOR_RATIO\'
                LIMIT 1
              ) AS reactor_ratio
            FROM guild g 
            INNER JOIN reactor r
              ON g.primary_reactor_id = r.id
            LEFT JOIN guild_meta gm
              ON g.id = gm.id
            WHERE gm.this_infrastructure = TRUE
            LIMIT 1;
        ';

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }

    /**
     * @return Response
     * @throws Exception
     */
    public function getGuildsDirectory(): Response
    {
        $query = '
            SELECT
              p.guild_id,
              gm.name,
              gm.logo,
              COALESCE(gf.fuel, 0) AS alpha,
              COUNT(1) AS members
            FROM player p
            INNER JOIN guild_meta gm
              ON p.guild_id = gm.id
            LEFT JOIN (
              SELECT
                vr.guild_id,
                SUM(COALESCE(vr.fuel, 0)) AS fuel
              FROM view.reactor vr
              GROUP BY vr.guild_id
            ) AS gf
              ON gm.id = gf.guild_id
            GROUP BY p.guild_id, gm.name, gm.logo, alpha
            ORDER BY members DESC, alpha DESC, gm.name;
        ';

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }
}