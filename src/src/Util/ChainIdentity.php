<?php

namespace App\Util;

class ChainIdentity
{
    private const string UINT64_MAX = '18446744073709551615';

    /** Canonical bech32 for a 20-byte account, e.g. structs1… or structsvaloper1… */
    public static function isAddress(mixed $value, string $prefix = 'structs'): bool
    {
        return is_string($value) && preg_match('/\A' . preg_quote($prefix, '/') . '1[02-9ac-hj-np-z]{38}\z/', $value) === 1;
    }

    /** Object id "<type>-<index>" with a nonzero uint64 index, e.g. 1-42 for a player. */
    public static function isObjectId(mixed $value, int $type): bool
    {
        if (!is_string($value) || !preg_match('/\A' . $type . '-([1-9][0-9]{0,19})\z/', $value, $match)) {
            return false;
        }

        return strlen($match[1]) < strlen(self::UINT64_MAX) || strcmp($match[1], self::UINT64_MAX) <= 0;
    }
}
