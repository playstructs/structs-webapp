<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class WorkManager
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
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getAllWorkByPlayerId(string $player_id): Response
    {
        $query = '
            SELECT vw.*
            FROM view.work vw
            WHERE vw.player_id = :player_id
            ORDER BY vw.block_start ASC;
        ';

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @throws Exception
     */
    public function getWorkByGuildId(string $guild_id, int $page): Response
    {
        $limit = PaginationLimits::DEFAULT;
        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT vw.object_id, vw.player_id, vw.target_id, vw.category, vw.block_start, vw.difficulty_target
            FROM view.work vw
            INNER JOIN structs.player p ON p.id = vw.player_id
            WHERE p.guild_id = :guild_id
            LIMIT $limit
            OFFSET $offset;
        ";

        $requestParams = [
            ApiParameters::GUILD_ID => $guild_id,
            ApiParameters::PAGE => (string) $page,
        ];
        $requiredFields = [ApiParameters::GUILD_ID, ApiParameters::PAGE];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @throws Exception
     */
    public function getAllWorkPaged(int $page): Response
    {
        $limit = PaginationLimits::DEFAULT;
        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT object_id, player_id, target_id, category, block_start, difficulty_target
            FROM view.work
            LIMIT $limit
            OFFSET $offset;
        ";

        $requestParams = [ApiParameters::PAGE => (string) $page];
        $requiredFields = [ApiParameters::PAGE];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }
}