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

    #[Assert\Choice(['0', '1'])]
    public ?string $fleet_away_only = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $guild_id = null;

    #[Assert\Regex(RegexPattern::INET)]
    public ?string $ip = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $logged_in_address = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $min_ore = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $offset = null;

    #[Assert\Regex(RegexPattern::PERMISSIONS)]
    public ?string $permissions = null;

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

    #[Assert\Regex(RegexPattern::SEARCH_STRING)]
    public ?string $search_string = null;

    #[Assert\Regex(RegexPattern::SIGNATURE)]
    public ?string $signature = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $struct_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $tx_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $unix_timestamp = null;

    #[Assert\Length(min: 0, max: 255)]
    public ?string $user_agent = null;

    #[Assert\Regex(RegexPattern::USERNAME)]
    public ?string $username = null;
}