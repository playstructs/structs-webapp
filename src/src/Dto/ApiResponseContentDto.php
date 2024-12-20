<?php

namespace App\Dto;

class ApiResponseContentDto
{
    public bool $success = false;

    public array $errors = [];

    public ?object $data = null;
}
