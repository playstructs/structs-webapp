<?php

namespace App\Util;

use UnexpectedValueException;

/** This deployment shares the browser's scheduled testnet activation rule. */
class ChainProtocol
{
    public const string CHAIN_ID = 'structstestnet-111';
    public const string UPGRADE_HEIGHT = '3353000';
    public const string LEGACY = 'v0.21.0';
    public const string CURRENT = 'v0.22.0';

    public static function atHeight(string $chainId, string $height): string
    {
        ExactAmount::unsigned($height, '9007199254740991');
        if ($chainId !== self::CHAIN_ID || $height === '0') {
            throw new UnexpectedValueException('Unsupported registration proof chain or height');
        }

        return (int) $height >= (int) self::UPGRADE_HEIGHT ? self::CURRENT : self::LEGACY;
    }

    public static function legacyTimeoutHeight(): string
    {
        return (string) ((int) self::UPGRADE_HEIGHT - 1);
    }
}
