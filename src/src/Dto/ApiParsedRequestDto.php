<?php

namespace App\Dto;

class ApiParsedRequestDto
{
    public array $errors = [];

    public ?ApiRequestParamsDto $params = null;
}
