<?php

namespace App\Dto;

class ParsedRequestDto
{
    public array $errors = [];

    public ?ApiRequestParamsDto $params = null;
}
