<?php

namespace App\Util;

use App\Constant\PaginationLimits;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/** Influence uses inclusive block ranges, not the time ranges used by stat APIs. */
final class InfluenceParameters
{
    public const MAX_HEIGHT = PHP_INT_MAX - 1000000;
    public const MAX_RANGE = 1000000;
    public const MAX_SAMPLES = 1000;
    public const MAX_ROWS = 10000;

    public static function only(array $query, array $allowed): void
    {
        foreach ($query as $key => $value) {
            if (!in_array($key, $allowed, true) || (!is_string($value) && !is_int($value))) {
                throw new BadRequestHttpException("Unsupported or non-scalar parameter: {$key}");
            }
        }
    }

    public static function integer(mixed $value, string $name, int $min = 0, int $max = self::MAX_HEIGHT): int
    {
        $s = is_int($value) ? (string) $value : $value;
        if (!is_string($s) || !preg_match('/\A(?:0|[1-9][0-9]*)\z/', $s)
            || strlen($s) > strlen((string) $max)
            || (strlen($s) === strlen((string) $max) && strcmp($s, (string) $max) > 0)
            || (int) $s < $min) {
            throw new BadRequestHttpException("{$name} must be an integer between {$min} and {$max}");
        }
        return (int) $s;
    }

    public static function objectId(mixed $value, string $kind): string
    {
        $prefix = $kind === 'guild' ? '0' : '1';
        if (!is_string($value) || !preg_match('/\A' . $prefix . '-([1-9][0-9]{0,19})\z/', $value, $m)
            || (strlen($m[1]) === 20 && strcmp($m[1], '18446744073709551615') > 0)) {
            throw new BadRequestHttpException("Invalid {$kind}_id");
        }
        return $value;
    }

    public static function sector(array $query): ?int
    {
        if (!array_key_exists('sector', $query)) return null;
        $sector = self::integer($query['sector'], 'sector', 0, 999);
        if (!in_array($sector, [0, 44, 127, 999], true)) {
            throw new BadRequestHttpException('sector must be 0, 44, 127, or 999');
        }
        return $sector;
    }

    public static function page(array $query, string $page): array
    {
        $number = self::integer($page, 'page', 1, 1000000);
        $raw = $query['limit'] ?? null;
        if ($raw !== null && $raw !== '') self::integer($raw, 'limit', 0, PHP_INT_MAX);
        $limit = PaginationLimits::clamp($raw);
        $total = $query['include_total'] ?? '0';
        if (!in_array((string) $total, ['0', '1'], true)) {
            throw new BadRequestHttpException('include_total must be 0 or 1');
        }
        if (isset($query['after_id']) && $number !== 1) {
            throw new BadRequestHttpException('after_id cannot be combined with a page other than 1');
        }
        return [$number, $limit, ($number - 1) * $limit, (string) $total === '1'];
    }
}
