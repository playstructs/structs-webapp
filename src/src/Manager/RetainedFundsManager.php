<?php

namespace App\Manager;

use App\Util\ChainProtocol;
use App\Util\ExactAmount;
use Exception;
use UnexpectedValueException;

/**
 * Verifies a player's retained funding addresses, up to a fixed number of
 * sources, and adds their spendable coins to the player's available Alpha.
 */
class RetainedFundsManager
{
    public const int MAX_SOURCES = 16;

    public function __construct(
        private ?ChainSnapshotManager $chain,
        private ?RetainedFundsReadCache $readCache = null,
    ) {
    }

    /**
     * @param array $player
     * @param array $meta
     * @param mixed $candidates
     * @param float|null $deadline
     * @return void
     */
    public function apply(
        array &$player,
        array $meta,
        mixed $candidates,
        ?float $deadline = null
    ): void {
        $player['retained_alpha_p'] = null;
        $player['retained_sources'] = [];
        $player['retained_funds_meta'] = [
            'ready' => false,
            'height' => null,
            'source_limit' => self::MAX_SOURCES,
            'complete' => false,
            'candidate_count' => null,
            'reason' => 'retained_evidence_unavailable'
        ];
        $player['available_alpha_p'] = $player['spendable_alpha_p'];

        if (
            ($player['funds_meta']['ready'] ?? false) !== true
            || ($meta['protocol'] ?? '') !== ChainProtocol::CURRENT
        ) {
            return;
        }

        try {
            $rows = is_string($candidates)
                ? json_decode($candidates, true, 16, JSON_THROW_ON_ERROR)
                : $candidates;

            if (!is_array($rows) || !array_is_list($rows) || count($rows) > self::MAX_SOURCES) {
                throw new UnexpectedValueException('Invalid retained funding window');
            }

            $height = $player['funds_meta']['height'];
            $deadline ??= hrtime(true) / 1e9 + 15.0;
            $candidateCount = ExactAmount::unsigned(
                $rows[0]['candidate_count'] ?? (string) count($rows)
            );

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

            $fetch = fn () => $this->readSources(
                $player['id'],
                $meta['chain_id'],
                $height,
                $rows,
                $deadline
            );
            $identity = hash('sha256', json_encode([
                $this->chain?->cacheScope(),
                $meta['chain_id'],
                $height,
                $player['id'],
                $player['vault_address'],
                $rows
            ], JSON_THROW_ON_ERROR));
            $evidence = $rows !== [] && $this->readCache !== null
                ? $this->readCache->read($player['id'], $identity, 1 + 2 * count($rows), $fetch)
                : $fetch();
            ['sources' => $sources, 'total' => $total] = $evidence;

            $player['available_alpha_p'] = ExactAmount::unsigned(
                bcadd($player['spendable_alpha_p'], $total, 0)
            );
            $player['alpha'] = ExactAmount::alphaDisplay($player['available_alpha_p']);
            $player['retained_alpha_p'] = $total;
            $player['retained_sources'] = $sources;
            $player['retained_funds_meta'] = [
                'ready' => true,
                'height' => $height,
                'source_limit' => self::MAX_SOURCES,
                'complete' => $candidateCount === (string) count($rows),
                'candidate_count' => $candidateCount,
                'reason' => null
            ];
        } catch (Exception $error) {
            // The verified vault remains usable. Unknown retained funds are not
            // included in available Alpha, and the API reports that distinction.
        }
    }

    /**
     * Reads every retained source at one height. The result is cached only as
     * a complete set, never as a partial read.
     *
     * @param string $ownerId
     * @param string $chainId
     * @param string $height
     * @param array $rows
     * @param float $deadline
     * @return array
     * @throws UnexpectedValueException
     */
    private function readSources(
        string $ownerId,
        string $chainId,
        string $height,
        array $rows,
        float $deadline
    ): array {
        if ($rows !== []) {
            if ($this->chain === null) {
                throw new UnexpectedValueException('Retained funding needs native evidence');
            }

            $this->chain->verifyChain($chainId, $deadline);
        }

        $sources = [];
        $total = '0';

        foreach ($rows as $row) {
            $address = $row['address'];
            $owner = $this->chain->get(
                '/structs/address/' . rawurlencode($address),
                $height,
                $deadline
            );

            if (($owner['address'] ?? null) !== $address) {
                throw new UnexpectedValueException('Funding address mismatch');
            }

            if (($owner['playerId'] ?? null) !== $ownerId) {
                continue;
            }

            $coin = $this->chain->get(
                '/cosmos/bank/v1beta1/spendable_balances/'
                . rawurlencode($address)
                . '/by_denom?denom=ualpha',
                $height,
                $deadline
            )['balance'] ?? null;

            if (($coin['denom'] ?? null) !== 'ualpha') {
                throw new UnexpectedValueException('Missing spendable coin');
            }

            $amount = ExactAmount::unsigned($coin['amount'] ?? null);

            if ($amount === '0') {
                continue;
            }

            $sources[] = ['address' => $address, 'spendable_alpha_p' => $amount];
            $total = ExactAmount::unsigned(bcadd($total, $amount, 0));
        }

        usort($sources, fn (array $a, array $b) => strcmp($a['address'], $b['address']));

        return ['sources' => $sources, 'total' => $total];
    }
}
