<?php

namespace App\Dto;

use App\Constant\RegexPattern;
use Symfony\Component\Validator\Constraints as Assert;

class ApiRequestParamsDto
{
    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $address = null;

    #[Assert\DateTime(format: 'Y-m-d H:i:sP')]
    public ?string $created_at = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $guild_id = null;

    #[Assert\Json]
    public ?string $pfp = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $primary_address = null;

    #[Assert\Regex(RegexPattern::PUBKEY)]
    public ?string $pubkey = null;

    #[Assert\Regex(RegexPattern::SIGNATURE)]
    public ?string $signature = null;

    #[Assert\DateTime(format: 'Y-m-d H:i:sP')]
    public ?string $updated_at = null;

    #[Assert\Regex(RegexPattern::USERNAME)]
    public ?string $username = null;
}