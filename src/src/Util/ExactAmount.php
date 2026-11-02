<?php

namespace App\Util;

use UnexpectedValueException;

class ExactAmount
{
    private const string SDK_MAX = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    public static function unsigned(mixed $value, string $maximum = self::SDK_MAX): string
    {
        if (!is_string($value) || !preg_match('/^(0|[1-9][0-9]*)$/D', $value)
            || strlen($value) > strlen($maximum)
            || (strlen($value) === strlen($maximum) && strcmp($value, $maximum) > 0)) {
            throw new UnexpectedValueException('Expected an exact unsigned decimal string');
        }

        return $value;
    }

    /** Existing whole-Alpha display, without floating point arithmetic. */
    public static function alphaDisplay(string $ualpha): string
    {
        self::unsigned($ualpha);

        return strlen($ualpha) > 6 ? substr($ualpha, 0, -6) : '0';
    }
}
