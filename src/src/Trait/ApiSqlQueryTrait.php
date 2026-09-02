<?php

namespace App\Trait;

use App\Dto\ApiParsedRequestDto;
use App\Dto\ApiResponseContentDto;
use App\Manager\ApiRequestParsingManager;
use App\Util\ResponseMetaUtil;
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
        [$responseContent, $status] = $this->runQuery(
            $entityManager,
            $apiRequestParsingManager,
            $sqlQuery,
            $apiRequestParams,
            $apiRequiredParams,
            false
        );

        return new JsonResponse($responseContent, $status);
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
        [$responseContent, $status] = $this->runQuery(
            $entityManager,
            $apiRequestParsingManager,
            $sqlQuery,
            $apiRequestParams,
            $apiRequiredParams,
            true
        );

        return new JsonResponse($responseContent, $status);
    }

    /**
     * As queryOne, with the source height stamped onto meta. Building the DTO once
     * avoids the decode/re-encode round trip a caller would otherwise need to reach
     * inside the finished response.
     *
     * @throws Exception
     */
    public function queryOneStamped(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams,
        ?string $apiModel = null
    ): Response {
        return $this->stampedQuery(
            $entityManager,
            $apiRequestParsingManager,
            $sqlQuery,
            $apiRequestParams,
            $apiRequiredParams,
            false,
            $apiModel
        );
    }

    /**
     * As queryAll, with the source height stamped onto meta.
     *
     * @throws Exception
     */
    public function queryAllStamped(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams,
        ?string $apiModel = null
    ): Response {
        return $this->stampedQuery(
            $entityManager,
            $apiRequestParsingManager,
            $sqlQuery,
            $apiRequestParams,
            $apiRequiredParams,
            true,
            $apiModel
        );
    }

    /**
     * @throws Exception
     */
    private function stampedQuery(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams,
        bool $fetchAll,
        ?string $apiModel
    ): Response {
        [$responseContent, $status] = $this->runQuery(
            $entityManager,
            $apiRequestParsingManager,
            $sqlQuery,
            $apiRequestParams,
            $apiRequiredParams,
            $fetchAll
        );

        if ($responseContent->success) {
            ResponseMetaUtil::stampHeight($responseContent, $entityManager, $apiModel);
        }

        return new JsonResponse($responseContent, $status);
    }

    /**
     * @return array{0: ApiResponseContentDto, 1: int}
     * @throws Exception
     */
    private function runQuery(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $sqlQuery,
        array $apiRequestParams,
        array $apiRequiredParams,
        bool $fetchAll
    ): array {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return [$responseContent, Response::HTTP_BAD_REQUEST];
        }

        $queryParams = $this->getQueryParams($apiRequiredParams, $parsedRequest);

        $db = $entityManager->getConnection();

        if ($fetchAll) {
            $responseContent->data = $db->fetchAllAssociative($sqlQuery, $queryParams);
        } else {
            $result = $db->fetchAssociative($sqlQuery, $queryParams);
            $responseContent->data = $result === false ? null : $result;
        }

        $responseContent->success = true;

        return [$responseContent, Response::HTTP_OK];
    }
}
