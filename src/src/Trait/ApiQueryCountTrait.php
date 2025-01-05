<?php

namespace App\Trait;

use App\Dto\ApiResponseContentDto;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiQueryCountTrait
{
    /**
     * @param EntityManagerInterface $entityManager
     * @param string $sqlCountQuery
     * @param array $queryParams
     * @return Response
     * @throws Exception
     */
    public function queryCount(
        EntityManagerInterface $entityManager,
        string $sqlCountQuery,
        array $queryParams = []
    ):Response {

        $db = $entityManager->getConnection();
        $count = $db->fetchOne($sqlCountQuery, $queryParams);
        $responseContent = new ApiResponseContentDto();
        $responseContent->data = (object)['count' => $count];
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}