<?php

namespace App\Trait;

use App\Dto\ApiParsedRequestDto;
use App\Dto\ApiResponseContentDto;
use App\Manager\ApiRequestParsingManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiSqlQueryTrait
{
    public function getQueryParams(
        array $apiRequiredParams,
        ApiParsedRequestDto $parsedRequest
    ):array {
        $queryParams = [];

        foreach ($apiRequiredParams as $param) {
            $queryParams[$param] = $parsedRequest->params->$param;
        }

        return $queryParams;
    }

    /**
     * @param EntityManagerInterface $entityManager
     * @param ApiRequestParsingManager $apiRequestParsingManager
     * @param string $sqlQuery
     * @param array $apiRequestParams
     * @param array $apiRequiredParams
     * @return Response
     * @throws Exception
     */
    public function queryOne(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams
    ):Response {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $queryParams = $this->getQueryParams($apiRequiredParams, $parsedRequest);

        $db = $entityManager->getConnection();
        $result = $db->fetchAssociative($sqlQuery, $queryParams);

        $responseContent->data = $result === false ? null : $result;
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @param EntityManagerInterface $entityManager
     * @param ApiRequestParsingManager $apiRequestParsingManager
     * @param string $sqlQuery
     * @param array $apiRequestParams
     * @param array $apiRequiredParams
     * @return Response
     * @throws Exception
     */
    public function queryAll(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams
    ):Response {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $queryParams = $this->getQueryParams($apiRequiredParams, $parsedRequest);

        $db = $entityManager->getConnection();
        $result = $db->fetchAllAssociative($sqlQuery, $queryParams);

        $responseContent->data = $result;
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}