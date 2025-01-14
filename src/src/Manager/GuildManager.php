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
              gm.id,
              gm.name
            FROM guild_meta gm
            INNER JOIN player p
              ON gm.id = p.guild_id
            GROUP BY gm.id, gm.name
            ORDER BY gm.name;
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
            SELECT n_live_tup AS "count"
            FROM pg_stat_all_tables
            WHERE relname = \'guild\'
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
              gm.status
            FROM guild g
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
              sum(i.fuel) as total_fuel,
              avg(i.power) as avg_power,
              avg(i.power) as total_power,
              avg(i.ratio) as avg_ratio,
              avg(i.commission) as avg_commission
            FROM player p
            INNER JOIN guild g
              ON p.guild_id = g.id
            INNER JOIN infusion i
              ON g.primary_reactor_id = i.destination_id
              AND p.id = i.player_id
            WHERE p.guild_Id = :guild_id
            GROUP BY p.guild_id;
        ';

        // TODO: Add guild aggregate load when aggregate stats added

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
}