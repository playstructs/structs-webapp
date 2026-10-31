<?php

namespace App\Util;

use Symfony\Component\HttpFoundation\Request;

class ClientKey
{
    /**
     * Rate-limit identity for a request's client. An IPv6 client usually
     * controls a whole /64, so the /64 is one client; IPv4-mapped addresses
     * count as their IPv4 address.
     */
    public static function fromRequest(?Request $request): string
    {
        $ip = $request?->getClientIp();
        $packed = $ip === null ? false : @inet_pton($ip);
        if ($packed === false) {
            return 'unavailable';
        }
        if (strlen($packed) === 4) {
            return inet_ntop($packed);
        }
        if (str_starts_with($packed, str_repeat("\0", 10) . "\xff\xff")) {
            return inet_ntop(substr($packed, 12));
        }

        return inet_ntop(substr($packed, 0, 8) . str_repeat("\0", 8)) . '/64';
    }
}
