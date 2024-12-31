<?php

namespace App\Manager;

use App\Dto\ApiRequestParamsDto;
use App\Dto\ParsedRequestDto;
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

    public function parse(
        Request $request,
        array $requiredParams,
        array $optionalParams = []
    ): ParsedRequestDto {

        $parsedRequest = new ParsedRequestDto();

        $content = json_decode($request->getContent(), true);

        if ($content === null) {
            $parsedRequest->errors = ["invalid_request_content" => "Invalid request content structure"];
            return $parsedRequest;
        }

        $apiRequestParams = new ApiRequestParamsDto();

        foreach ($requiredParams as $requiredParam) {
            if (!isset($content[$requiredParam])) {
                $parsedRequest->errors["{$requiredParam}_required"] = "{$requiredParam} is required";
            } else {
                $apiRequestParams->$requiredParam = $content[$requiredParam];
            }
        }

        foreach ($optionalParams as $optionalParam) {
            $apiRequestParams->$optionalParam = $content[$optionalParam] ?? null;
        }

        $constraintViolationList = $this->validator->validate($apiRequestParams);
        $parsedRequest->errors +=  $this->constraintViolationUtil->getErrorMessages($constraintViolationList);

        if (count($parsedRequest->errors) === 0) {
            $parsedRequest->params = $apiRequestParams;
        }

        return $parsedRequest;
    }
}