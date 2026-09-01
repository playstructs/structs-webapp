<?php

namespace App\Dto;

class ApiResponseContentDto implements \JsonSerializable
{
    public bool $success = false;

    public array $errors = [];

    public object|array|null $data = null;

    public mixed $total = null;

    public ?array $meta = null;

    public function jsonSerialize(): array
    {
        $payload = [
            'success' => $this->success,
            'errors' => $this->errors,
            'data' => $this->data,
        ];

        if ($this->total !== null) {
            $payload['total'] = $this->total;
        }

        if ($this->meta !== null) {
            $payload['meta'] = $this->meta;
        }

        return $payload;
    }
}
