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
        array $optionalParams = [],
        bool $includeQueryParams = false
    ): ApiParsedRequestDto
    {
        $parsedRequest = new ApiParsedRequestDto();

        $content = json_decode($request->getContent(), true);

        if (!is_array($content)) {
            $parsedRequest->errors = ["invalid_request_content" => "Invalid request content structure"];
            return $parsedRequest;
        }

        if ($includeQueryParams) {
            $content = $content + $request->request->all();
        }

        return $this->parse($content, $requiredParams, $optionalParams);
    }

    /**
     * Like parseJsonRequest, but also accepts a browser form submission.
     *
     * A plain HTML form cannot send JSON, so an endpoint that a page needs to
     * POST to directly (rather than through fetch) has to read
     * application/x-www-form-urlencoded as well. The field names and validation
     * are identical either way; only the envelope differs.
     */
    public function parseJsonOrFormRequest(
        Request $request,
        array $requiredParams,
        array $optionalParams = []
    ): ApiParsedRequestDto
    {
        // An empty form body falls through to the JSON path so a request with
        // no usable content is reported the same way it always has been.
        if ($request->getContentTypeFormat() === 'form' && $request->request->count() > 0) {
            return $this->parse($request->request->all(), $requiredParams, $optionalParams);
        }

        return $this->parseJsonRequest($request, $requiredParams, $optionalParams);
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
