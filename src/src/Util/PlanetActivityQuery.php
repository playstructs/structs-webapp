<?php

namespace App\Util;

use DateTimeImmutable;
use UnexpectedValueException;

/** The hypertable's exact (time, planet_id, seq) key, including microseconds. */
class PlanetActivityQuery
{
    public static function parse(string $planetId, string $seq, array $query): array
    {
        if (array_keys($query) !== ['time'] || !preg_match('/^2-([1-9][0-9]*)$/D', $planetId, $id)) {
            throw new UnexpectedValueException('Expected a planet activity key');
        }
        ExactAmount::unsigned($id[1], '18446744073709551615');
        ExactAmount::unsigned($seq, '2147483647');
        $time = $query['time'];
        if (!is_string($time) || !preg_match('/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/D', $time, $parts)) {
            throw new UnexpectedValueException('Expected an exact activity timestamp');
        }
        $zone = $parts[3] === 'Z' ? '+00:00' : $parts[3];
        if (substr($zone, 1, 2) > '14' || substr($zone, 4, 2) > '59'
            || (substr($zone, 1, 2) === '14' && substr($zone, 4, 2) !== '00')) {
            throw new UnexpectedValueException('Invalid activity timezone');
        }
        $formatted = $parts[1] . '.' . str_pad($parts[2] ?? '', 6, '0') . $zone;
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i:s.uP', $formatted);
        if (str_starts_with($formatted, '0000-') || !$parsed || $parsed->format('Y-m-d\TH:i:s.uP') !== $formatted) {
            throw new UnexpectedValueException('Invalid activity timestamp');
        }
        return ['planet_id' => $planetId, 'seq' => $seq, 'time' => $time];
    }
}
