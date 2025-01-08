<?php

namespace App\Dto;

use App\Constant\RegexPattern;
use Symfony\Component\Validator\Constraints as Assert;

class ApiRequestParamsDto
{
    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $address = null;

    #[Assert\Regex(RegexPattern::CODE)]
    public ?string $code = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $guild_id = null;

    #[Assert\Regex(RegexPattern::INET)]
    public ?string $ip = null;

    #[Assert\Json]
    public ?string $pfp = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $planet_id = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $player_id = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $primary_address = null;

    #[Assert\Regex(RegexPattern::PUBKEY)]
    public ?string $pubkey = null;

    #[Assert\Regex(RegexPattern::SIGNATURE)]
    public ?string $signature = null;

    #[Assert\Length(min: 0, max: 255)]
    public ?string $user_agent = null;

    #[Assert\Regex(RegexPattern::USERNAME)]
    public ?string $username = null;
}