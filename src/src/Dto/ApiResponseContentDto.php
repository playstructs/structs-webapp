<?php

namespace App\Dto;

class ApiResponseContentDto
{
    public bool $success = false;

    public array $errors = [];

    public object|array|null $data = null;
}
