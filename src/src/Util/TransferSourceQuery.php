<?php

namespace App\Util;

use DateTimeImmutable;
use UnexpectedValueException;

/** Coordinates from the client's verified committed result, never a hash guess. */
class TransferSourceQuery
{
    public static function parse(string $playerId, array $query): array
    {
        $required = ['chain_id', 'block_height', 'tx_index', 'block_time', 'address', 'counterparty', 'denom', 'amount_p'];
        if (array_diff($required, array_keys($query)) || array_diff(array_keys($query), [...$required, 'msg_index', 'event_index'])) {
            throw new UnexpectedValueException('Invalid transfer source fields');
        }
        if (!preg_match('/^1-([1-9][0-9]*)$/D', $playerId, $owner)) {
            throw new UnexpectedValueException('Invalid player');
        }
        ExactAmount::unsigned($owner[1], '18446744073709551615');
        if ($query['chain_id'] !== 'structstestnet-111' || $query['denom'] !== 'ualpha') {
            throw new UnexpectedValueException('Unsupported transfer source');
        }
        foreach (['address', 'counterparty'] as $name) {
            if (!is_string($query[$name]) || !preg_match('/^structs1[02-9ac-hj-np-z]{38}$/D', $query[$name])) {
                throw new UnexpectedValueException('Invalid transfer address');
            }
        }
        $query['block_height'] = ExactAmount::unsigned($query['block_height'], '9223372036854775807');
        $query['tx_index'] = ExactAmount::unsigned($query['tx_index'], '2147483647');
        $query['amount_p'] = ExactAmount::unsigned($query['amount_p']);
        if ($query['block_height'] === '0' || $query['amount_p'] === '0') {
            throw new UnexpectedValueException('Transfer height and amount must be positive');
        }
        foreach (['msg_index', 'event_index'] as $name) {
            if (array_key_exists($name, $query) && !($name === 'msg_index' && $query[$name] === '-1')) {
                $query[$name] = ExactAmount::unsigned($query[$name], '2147483647');
            }
        }
        if (!is_string($query['block_time']) || !preg_match(
            '/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z$/D', $query['block_time'], $time
        )) {
            throw new UnexpectedValueException('Expected a UTC block time');
        }
        // pgx writes time.Time using truncated microseconds. PostgreSQL rounds
        // nanosecond text instead; passing it through unchanged misses the row.
        $micros = $time[1] . '.' . substr(str_pad($time[2] ?? '', 6, '0'), 0, 6) . 'Z';
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i:s.u\Z', $micros, new \DateTimeZone('UTC'));
        if (str_starts_with($micros, '0000-') || !$parsed || $parsed->format('Y-m-d\TH:i:s.u\Z') !== $micros) {
            throw new UnexpectedValueException('Invalid block time');
        }
        $query['block_time'] = $micros;
        $query['player_id'] = $playerId;

        return $query;
    }
}
