<?php

namespace App\Trait;

use App\Dto\ApiResponseContentDto;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiQueryTrait
{
    /**
     * @param EntityManagerInterface $entityManager
     * @param string $sqlQuery
     * @param array $queryParams
     * @return Response
     * @throws Exception
     */
    public function queryOne(
        EntityManagerInterface $entityManager,
        string $sqlQuery,
        array $queryParams = []
    ):Response {

        $db = $entityManager->getConnection();
        $result = $db->fetchAssociative($sqlQuery, $queryParams);
        $responseContent = new ApiResponseContentDto();
        $responseContent->data = $result === false ? null : $result;
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}