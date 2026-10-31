<?php

namespace App\Manager;

use App\Util\ExactAmount;
use Exception;
use UnexpectedValueException;

/** Verify a bounded funding window without treating holdings as spendable coins. */
class RetainedFundsManager
{
    public const int MAX_SOURCES = 16;

    public function __construct(private ?ChainSnapshotManager $chain)
    {
    }

    public function apply(array &$player, array $meta, mixed $candidates, ?float $deadline = null): void
    {
        $player['retained_alpha_p'] = null;
        $player['retained_sources'] = [];
        $player['retained_funds_meta'] = ['ready' => false, 'height' => null,
            'source_limit' => self::MAX_SOURCES, 'complete' => false,
            'candidate_count' => null, 'reason' => 'retained_evidence_unavailable'];
        $player['available_alpha_p'] = $player['spendable_alpha_p'];
        if (($player['funds_meta']['ready'] ?? false) !== true || ($meta['protocol'] ?? '') !== 'v0.22.0') {
            return;
        }
        try {
            $rows = is_string($candidates) ? json_decode($candidates, true, 16, JSON_THROW_ON_ERROR) : $candidates;
            if (!is_array($rows) || !array_is_list($rows) || count($rows) > self::MAX_SOURCES) {
                throw new UnexpectedValueException('Invalid retained funding window');
            }
            $height = $player['funds_meta']['height'];
            $deadline ??= hrtime(true) / 1e9 + 15.0;
            $candidateCount = ExactAmount::unsigned($rows[0]['candidate_count'] ?? (string) count($rows));
            if (bccomp($candidateCount, (string) count($rows), 0) < 0) {
                throw new UnexpectedValueException('Invalid retained candidate count');
            }
            $seen = [];
            foreach ($rows as $row) {
                $address = $row['address'] ?? '';
                AddressRegistrationProofManager::validateIdentity($player['id'], $address);
                if ($address === $player['vault_address'] || isset($seen[$address])) {
                    throw new UnexpectedValueException('Duplicate or vault funding source');
                }
                $seen[$address] = true;
            }
            if ($rows !== []) {
                if ($this->chain === null) throw new UnexpectedValueException('Retained funding needs native evidence');
                $this->chain->verifyChain($meta['chain_id'], $deadline);
            }
            $sources = [];
            $total = '0';
            foreach ($rows as $row) {
                $address = $row['address'];
                $owner = $this->chain->get('/structs/address/' . rawurlencode($address), $height, $deadline);
                if (($owner['address'] ?? null) !== $address) throw new UnexpectedValueException('Funding address mismatch');
                if (($owner['playerId'] ?? null) !== $player['id']) continue;
                $coin = $this->chain->get('/cosmos/bank/v1beta1/spendable_balances/'
                    . rawurlencode($address) . '/by_denom?denom=ualpha', $height, $deadline)['balance'] ?? null;
                if (($coin['denom'] ?? null) !== 'ualpha') throw new UnexpectedValueException('Missing spendable coin');
                $amount = ExactAmount::unsigned($coin['amount'] ?? null);
                if ($amount === '0') continue;
                $sources[] = ['address' => $address, 'spendable_alpha_p' => $amount];
                $total = ExactAmount::unsigned(bcadd($total, $amount, 0));
            }
            usort($sources, fn (array $a, array $b) => strcmp($a['address'], $b['address']));
            $player['available_alpha_p'] = ExactAmount::unsigned(bcadd($player['spendable_alpha_p'], $total, 0));
            $player['alpha'] = ExactAmount::alphaDisplay($player['available_alpha_p']);
            $player['retained_alpha_p'] = $total;
            $player['retained_sources'] = $sources;
            $player['retained_funds_meta'] = ['ready' => true, 'height' => $height,
                'source_limit' => self::MAX_SOURCES, 'complete' => $candidateCount === (string) count($rows),
                'candidate_count' => $candidateCount, 'reason' => null];
        } catch (Exception $error) {
            // The verified vault remains usable. Unknown retained funds are not
            // included in available Alpha, and the API reports that distinction.
        }
    }
}
