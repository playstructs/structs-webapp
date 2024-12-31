<?php

namespace App\Constant;

class RegexPattern
{
    public const string ADDRESS = '/^[a-zA-Z0-9]+$/';

    public const string ID = '/^[a-zA-Z0-9\-]+$/';

    public const string PUBKEY = '/^[a-zA-Z0-9]+$/';

    public const string SIGNATURE = '/^[a-zA-Z0-9]+$/';

    public const string USERNAME = '/^[\p{L}0-9-_]{1,20}$/';

    public const array PARAM_TO_PATTERN = [
        ApiParameters::ADDRESS => self::ADDRESS,
        ApiParameters::GUILD_ID => self::ID,
        ApiParameters::PRIMARY_ADDRESS => self::ADDRESS,
        ApiParameters::PUBKEY => self::PUBKEY,
        ApiParameters::SIGNATURE => self::SIGNATURE
    ];
}
