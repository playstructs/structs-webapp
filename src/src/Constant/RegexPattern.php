<?php

namespace App\Constant;

class RegexPattern
{
    public const string ADDRESS = '/^[a-zA-Z0-9]+$/';

    public const string CODE = '/^[a-zA-Z0-9]+$/';

    public const string ID = '/^[a-zA-Z0-9\-]+$/';

    public const string INET = '/^([a-fA-F0-9]{0,4}(:[a-fA-F0-9]{0,4}){0,7})?(\d{1,3}(\.\d{1,3}){0,3}(\/\d{1,2})?)?$/';

    public const string INT = '/^[0-9]+$/';

    public const string PUBKEY = '/^[a-zA-Z0-9]+$/';

    public const string SEARCH_STRING = '/^[\p{L}0-9-_]+$/';

    public const string SEARCH_STRING_FILTER = '/[^\p{L}0-9-_]+/';

    public const string SIGNATURE = '/^[a-zA-Z0-9]+$/';

    public const string USERNAME = '/^[\p{L}0-9-_]{3,20}$/';
}
