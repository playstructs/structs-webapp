<?php

namespace App\Dto;

use App\Constant\RegexPattern;
use Symfony\Component\Validator\Constraints as Assert;

class ApiRequestParamsDto
{
    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $address = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $allocation_id = null;

    #[Assert\Regex(RegexPattern::SLUG)]
    public ?string $attribute_type = null;

    #[Assert\Regex(RegexPattern::CODE)]
    public ?string $code = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $controller = null;

    #[Assert\Choice(['0', '1'])]
    public ?string $count_only = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $creator = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $delegator_address = null;

    #[Assert\Regex(RegexPattern::SLUG)]
    public ?string $denom = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $destination_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $end_time = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $entry_substation_id = null;

    #[Assert\Choice(['0', '1'])]
    public ?string $fleet_away_only = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $fleet_id = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $guild_id = null;

    #[Assert\Regex(RegexPattern::INET)]
    public ?string $ip = null;

    #[Assert\Regex(RegexPattern::SLUG)]
    public ?string $label = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $location_id = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $logged_in_address = null;

    #[Assert\Choice(choices: [
        'ore', 'fuel', 'capacity', 'load', 'power',
        'structs_load', 'connection_count', 'connection_capacity', 'struct_health', 'struct_status',
    ])]
    public ?string $metric = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $min_ore = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $object_id = null;

    #[Assert\Regex(RegexPattern::OBJECT_KEY)]
    public ?string $object_key = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $offset = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $owner = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $page = null;

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

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $primary_reactor_id = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $provider_id = null;

    #[Assert\Regex(RegexPattern::PUBKEY)]
    public ?string $pubkey = null;

    #[Assert\Regex(RegexPattern::SEARCH_STRING)]
    public ?string $search_string = null;

    #[Assert\Regex(RegexPattern::SIGNATURE)]
    public ?string $signature = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $source_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $start_time = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $struct_id = null;

    #[Assert\Regex(RegexPattern::ID)]
    public ?string $substation_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $tx_id = null;

    #[Assert\Regex(RegexPattern::INT)]
    public ?string $unix_timestamp = null;

    #[Assert\Length(min: 0, max: 255)]
    public ?string $user_agent = null;

    #[Assert\Regex(RegexPattern::USERNAME)]
    public ?string $username = null;

    #[Assert\Regex(RegexPattern::ADDRESS)]
    public ?string $validator_address = null;
}
