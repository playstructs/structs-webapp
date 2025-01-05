<?php

namespace App\Trait;

use App\Dto\ApiResponseContentDto;
use App\Entity\AbstractEntity;
use App\Manager\ApiRequestParsingManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiSelectOneTrait
{
    public function getClassShortName($className): string
    {
        return preg_replace('/^.*\\\/', '', $className);
    }

    public function selectOne(
        EntityManagerInterface $entityManager,
        ApiRequestParsingManager $apiRequestParsingManager,
        string $targetResourceClassName,
        array $apiRequestParams,
        array $apiRequiredParams,
        array $apiOptionalParams = [],
        array $criteria = [],
        array $returnFields = []
    ):Response {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams,
            $apiOptionalParams
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $repository = $entityManager->getRepository($targetResourceClassName);
        /** @var AbstractEntity|null $resource */
        $resource = $repository->findOneBy($criteria);

        if ($resource === null) {
            $responseContent->errors = ['resource_not_found' => "{$this->getClassShortName($targetResourceClassName)} not found"];
            return new JsonResponse($responseContent, Response::HTTP_NOT_FOUND);
        }

        $responseContent->data = $resource;

        if (count($returnFields) > 0) {
            $data = [];
            foreach ($returnFields as $field) {
                $data[$field] = $resource->get($field);
            }
            $responseContent->data = $data;
        }

        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}