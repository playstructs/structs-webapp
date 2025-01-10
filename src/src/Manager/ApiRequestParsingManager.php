<?php

namespace App\Manager;

use App\Dto\ApiRequestParamsDto;
use App\Dto\ApiParsedRequestDto;
use App\Util\ConstraintViolationUtil;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApiRequestParsingManager
{
    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public function __construct(
        ValidatorInterface $validator,
        ConstraintViolationUtil $constraintViolationUtil
    )
    {
        $this->validator = $validator;
        $this->constraintViolationUtil = $constraintViolationUtil;
    }

    public function filterRequestParams(
        Request $request,
        array $filterParams
    ): Request {
        foreach ($filterParams as $param => $filterPattern) {
            $value = $request->query->get($param);
            if ($value !== null) {
                $value = preg_replace($filterPattern, '', $value);
                $request->query->set($param, $value);
            }
        }
        return $request;
    }

    public function parseJsonRequest(
        Request $request,
        array $requiredParams,
        array $optionalParams = []
    ): ApiParsedRequestDto
    {
        $parsedRequest = new ApiParsedRequestDto();

        $content = json_decode($request->getContent(), true);

        if (!is_array($content)) {
            $parsedRequest->errors = ["invalid_request_content" => "Invalid request content structure"];
            return $parsedRequest;
        }

        return $this->parse($content, $requiredParams, $optionalParams);
    }

    public function parse(
        array $requestParams,
        array $requiredParams,
        array $optionalParams = []
    ): ApiParsedRequestDto
    {
        $parsedRequest = new ApiParsedRequestDto();
        $apiRequestParams = new ApiRequestParamsDto();

        foreach ($requiredParams as $requiredParam) {
            if (!isset($requestParams[$requiredParam])) {
                $parsedRequest->errors["{$requiredParam}_required"] = "{$requiredParam} is required";
            } else {
                $apiRequestParams->$requiredParam = $requestParams[$requiredParam];
            }
        }

        foreach ($optionalParams as $optionalParam) {
            $apiRequestParams->$optionalParam = $requestParams[$optionalParam] ?? null;
        }

        $constraintViolationList = $this->validator->validate($apiRequestParams);
        $parsedRequest->errors +=  $this->constraintViolationUtil->getErrorMessages($constraintViolationList);

        if (count($parsedRequest->errors) === 0) {
            $parsedRequest->params = $apiRequestParams;
        }

        return $parsedRequest;
    }
}
