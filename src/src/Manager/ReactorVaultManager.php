<?php

namespace App\Manager;

use App\Util\ChainProtocol;
use App\Util\ConsistentRead;
use App\Util\ExactAmount;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Connection;
use Exception;
use UnexpectedValueException;

/** Complete the missing canonical source without inventing a provisioned association. */
class ReactorVaultManager
{
    private const string UINT64 = '18446744073709551615';

    public function __construct(private ChainSnapshotManager $chain)
    {
    }

    public function apply(array &$reactor, array $meta, Connection $db): void
    {
        if (($meta['protocol'] ?? null) !== ChainProtocol::CURRENT || ($meta['data_ready'] ?? false) !== true
            || ($reactor['positions_meta']['reason'] ?? null) !== 'vault_unindexed') {
            return;
        }
        try {
            $height = ExactAmount::unsigned($meta['height'] ?? null, '9223372036854775807');
            $owner = $reactor['owner_id'] ?? '';
            $validator = $reactor['validator'] ?? '';
            if ($height === '0' || $height !== ($meta['indexed_height'] ?? null)
                || $height !== ($reactor['positions_meta']['height'] ?? null)
                || !preg_match('/^1-([1-9][0-9]*)$/D', $owner, $id)
                || $owner !== ($reactor['player_id'] ?? null) || $reactor['vault_address'] !== null
                || !preg_match('/^3-[1-9][0-9]*$/D', $reactor['destination_id'] ?? '')
                || ($reactor['positions_meta']['power_ready'] ?? false) !== true
                || !is_array($reactor['positions'] ?? null) || count($reactor['positions']) >= 1024) {
                throw new UnexpectedValueException('Incomplete retained reactor context');
            }
            ExactAmount::unsigned($id[1], self::UINT64);
            $this->address($validator, 'structsvaloper');
            $seen = [];
            $fuel = '0';
            $unbonding = '0';
            foreach ($reactor['positions'] as $position) {
                $address = $this->address($position['address'] ?? null);
                if (isset($seen[$address]) || ($position['is_vault'] ?? null) !== false
                    || ($position['owner_id'] ?? null) !== $owner || ($position['validator'] ?? null) !== $validator
                    || ($position['native_ready'] ?? false) !== true || ($position['power_ready'] ?? false) !== true) {
                    throw new UnexpectedValueException('Retained reactor coverage unavailable');
                }
                $seen[$address] = true;
                $fuel = bcadd($fuel, ExactAmount::unsigned($position['fuel_p'] ?? null), 0);
                $unbonding = bcadd($unbonding, ExactAmount::unsigned($position['defusing_p'] ?? null), 0);
            }
            $deadline = hrtime(true) / 1e9 + 4.0;
            $this->chain->verifyChain($meta['chain_id'] ?? '', $deadline);
            $vault = $this->chain->get('/structs/vault/' . rawurlencode($owner), $height, $deadline);
            $source = $this->address($vault['address'] ?? null);
            if (($vault['ownerId'] ?? null) !== $owner || ($vault['provisioned'] ?? null) !== false || isset($seen[$source])) {
                throw new UnexpectedValueException('Indexed vault association is incomplete');
            }

            // A second short read obtains the previously unknown address's game
            // position. It must still be the original boundary. No HTTP in SQL.
            $stored = ConsistentRead::run($db, function () use ($db, $meta, $reactor, $source): array {
                $current = ResponseMetaUtil::snapshotMeta($db, 'inventory');
                foreach (['chain_id', 'height', 'indexed_height', 'protocol', 'cache_epoch', 'inventory_authority'] as $key) {
                    if (!isset($meta[$key]) || ($current[$key] ?? null) !== $meta[$key]) {
                        throw new UnexpectedValueException('Reactor snapshot advanced');
                    }
                }
                if (($current['data_ready'] ?? false) !== true) {
                    throw new UnexpectedValueException('Reactor snapshot unavailable');
                }
                return $db->fetchAssociative('SELECT i.destination_id IS NOT NULL AS has_infusion,
                    i.destination_type, COALESCE(NULLIF(i.owner_id, \'\'), i.player_id) AS recorded_owner_id,
                    i.fuel_p::text, i.defusing_p::text, i.power_p::text, i.ratio_p::text, i.commission::text,
                    (EXISTS (SELECT 1 FROM structs.vault WHERE address=:address)
                      OR EXISTS (SELECT 1 FROM structs.player_address WHERE address=:address AND status=\'approved\')) AS claimed
                    FROM (VALUES (1)) AS seed(n) LEFT JOIN structs.infusion i
                      ON i.destination_id=:reactor AND i.address=:address',
                    ['reactor' => $reactor['destination_id'], 'address' => $source]);
            });
            if ($stored['claimed'] !== false) {
                throw new UnexpectedValueException('Unprovisioned vault has conflicting ownership');
            }
            [$power, $ownerPower] = $this->power($stored, $owner);
            [$bonded, $pending, $entries] = $this->nativePosition($source, $validator, $height, $deadline);
            $position = ['address' => $source, 'is_vault' => true, 'owner_id' => $owner,
                'recorded_owner_id' => $stored['recorded_owner_id'], 'validator' => $validator,
                'native_ready' => true, 'source_height' => $height, 'fuel_p' => $bonded,
                'defusing_p' => $pending, 'unbonding_entries' => $entries,
                'power_p' => $power, 'owner_power_p' => $ownerPower, 'power_ready' => true,
                'stored_fuel_p' => $stored['fuel_p'], 'stored_defusing_p' => $stored['defusing_p'],
                'ratio_p' => $stored['ratio_p'], 'commission' => $stored['commission']];
            $complete = $reactor;
            $complete['vault_address'] = $source;
            array_unshift($complete['positions'], $position);
            $complete['fuel_p'] = bcadd($fuel, $bonded, 0);
            $complete['defusing_p'] = bcadd($unbonding, $pending, 0);
            $complete['power_p'] = bcadd(ExactAmount::unsigned($reactor['power_p']), $power, 0);
            $complete['owner_power_p'] = bcadd(ExactAmount::unsigned($reactor['owner_power_p']), $ownerPower, 0);
            foreach (['fuel', 'defusing', 'power', 'owner_power'] as $field) {
                ExactAmount::unsigned($complete[$field . '_p']);
                $complete[$field] = bcdiv($complete[$field . '_p'], str_contains($field, 'power') ? '1000' : '1000000', 0);
            }
            $complete['positions_meta']['complete'] = true;
            $complete['positions_meta']['reason'] = null;
            $complete['positions_meta']['vault_provisioned'] = false;
            $complete['positions_meta']['vault_source'] = 'chain_snapshot';
            $reactor = $complete; // Publish only the complete result, never partial pages.
        } catch (Exception $error) {
            $reactor['positions_meta']['reason'] = 'vault_evidence_unavailable';
        }
    }

    private function address(mixed $value, string $prefix = 'structs'): string
    {
        if (!is_string($value) || !preg_match('/^' . $prefix . '1[02-9ac-hj-np-z]{38}$/D', $value)) {
            throw new UnexpectedValueException('Invalid native staking address');
        }
        return $value;
    }

    private function power(array $row, string $owner): array
    {
        if ($row['has_infusion'] === false) {
            return ['0', '0'];
        }
        if ($row['has_infusion'] !== true || $row['destination_type'] !== 'reactor' || $row['recorded_owner_id'] !== $owner) {
            throw new UnexpectedValueException('Reactor applied power ownership mismatch');
        }
        foreach (['fuel_p', 'defusing_p', 'power_p', 'ratio_p'] as $field) {
            ExactAmount::unsigned($row[$field], self::UINT64);
        }
        $commission = $row['commission'];
        if (!is_string($commission) || !preg_match('/^(0|1)(\.[0-9]{1,18})?$/D', $commission) || bccomp($commission, '1', 18) > 0) {
            throw new UnexpectedValueException('Invalid reactor commission');
        }
        $product = bcmul($row['power_p'], $commission, 18);
        $whole = bcdiv($product, '1', 0);
        $half = bccomp(bcsub($product, $whole, 18), '0.5', 18);
        if ($half > 0 || ($half === 0 && bcmod($whole, '2', 0) === '1')) {
            $whole = bcadd($whole, '1', 0);
        }
        return [$row['power_p'], bcsub($row['power_p'], $whole, 0)];
    }

    private function nativePosition(string $address, string $validator, string $height, float $deadline): array
    {
        $bonded = '0';
        $pending = '0';
        $entries = 0;
        $seen = [];
        foreach ($this->pages('/cosmos/staking/v1beta1/delegations/' . $address, 'delegation_responses', $height, $deadline) as $row) {
            $delegation = $row['delegation'] ?? [];
            $target = $this->address($delegation['validator_address'] ?? null, 'structsvaloper');
            $shares = $delegation['shares'] ?? null;
            if (($delegation['delegator_address'] ?? null) !== $address || isset($seen[$target])
                || ($row['balance']['denom'] ?? null) !== 'ualpha' || !is_string($shares)
                || !preg_match('/^(0|[1-9][0-9]{0,77})(\.[0-9]{1,18})?$/D', $shares) || bccomp($shares, '0', 18) <= 0) {
                throw new UnexpectedValueException('Invalid native delegation');
            }
            $seen[$target] = true;
            $amount = ExactAmount::unsigned($row['balance']['amount'] ?? null);
            if ($target === $validator) {
                $bonded = $amount;
            }
        }
        $seen = [];
        $entryCount = 0;
        foreach ($this->pages('/cosmos/staking/v1beta1/delegators/' . $address . '/unbonding_delegations', 'unbonding_responses', $height, $deadline) as $row) {
            $target = $this->address($row['validator_address'] ?? null, 'structsvaloper');
            if (($row['delegator_address'] ?? null) !== $address || isset($seen[$target])
                || !is_array($row['entries'] ?? null) || !array_is_list($row['entries'])
                || ($entryCount += count($row['entries'])) > 8192) {
                throw new UnexpectedValueException('Invalid native unbonding delegation');
            }
            $seen[$target] = true;
            foreach ($row['entries'] as $entry) {
                $amount = ExactAmount::unsigned($entry['balance'] ?? null);
                if ($target === $validator) {
                    $pending = bcadd($pending, $amount, 0);
                    $entries++; // Include zero, held and past-time entries until staking removes them.
                }
            }
        }
        return [$bonded, $pending, $entries];
    }

    private function pages(string $path, string $field, string $height, float $deadline): array
    {
        $rows = [];
        $key = '';
        $seen = [];
        for ($page = 0; $page < 4; $page++) {
            $response = $this->chain->get($path . '?pagination.limit=100&pagination.key=' . rawurlencode($key), $height, $deadline);
            if (!is_array($response[$field] ?? null) || !array_is_list($response[$field]) || count($response[$field]) > 100
                || !is_array($response['pagination'] ?? null) || !array_key_exists('next_key', $response['pagination'])) {
                throw new UnexpectedValueException('Incomplete native staking page');
            }
            array_push($rows, ...$response[$field]);
            $key = $response['pagination']['next_key'];
            if ($key === '' || $key === null) {
                return $rows;
            }
            if (!is_string($key) || strlen($key) > 4096 || isset($seen[$key])) {
                throw new UnexpectedValueException('Invalid native staking cursor');
            }
            $seen[$key] = true;
        }
        throw new UnexpectedValueException('Native staking page limit exceeded');
    }
}
