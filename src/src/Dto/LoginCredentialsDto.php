<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class LoginCredentialsDto
{
    #[
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $address = null;

    #[
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $guild_id = null;

    #[
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $signature = null;

    #[
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $pubkey = null;
}