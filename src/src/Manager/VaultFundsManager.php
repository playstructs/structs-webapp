<?php

namespace App\Manager;

use App\Util\ExactAmount;
use Exception;
use UnexpectedValueException;

/** Adapt one ready indexed player snapshot; never changes account identity. */
class VaultFundsManager
{
    public function __construct(
        private ?ChainSnapshotManager $chain = null,
        private ?RetainedFundsManager $retainedFunds = null,
    ) {
    }

    public function apply(array &$player, array &$meta): void
    {
        $address = $player['_vault_address'] ?? null;
        $created = $player['_vault_account_created'] ?? null;
        $balance = $player['_vault_balance_p'] ?? null;
        $retained = $player['_retained_funding_sources'] ?? [];
        unset($player['_vault_address'], $player['_vault_account_created'], $player['_vault_balance_p'], $player['_retained_funding_sources']);
        $player['vault_address'] = $address;
        $player['spendable_alpha_p'] = null;
        $player['funds_meta'] = ['height' => null, 'ready' => false, 'source' => null,
            'provisioned' => $address === null ? null : true, 'reason' => 'indexed_state_unavailable'];

        if (($meta['protocol'] ?? null) === 'v0.21.0') {
            $player['funds_meta']['reason'] = 'legacy_protocol';
            return; // Preserve pre-upgrade display and transaction behavior.
        }
        $player['alpha'] = null;
        if (($meta['protocol'] ?? null) !== 'v0.22.0' || ($meta['data_ready'] ?? false) !== true) {
            $meta['transaction_ready'] = false;
            return;
        }

        try {
            $deadline = hrtime(true) / 1e9 + 15.0;
            $height = ExactAmount::unsigned($meta['height'] ?? null, '9223372036854775807');
            if ($height === '0' || $height !== ($meta['indexed_height'] ?? null)) {
                throw new UnexpectedValueException('Funds require the indexed snapshot boundary');
            }
            if ($address !== null && $created === true) {
                // v0.22's newly provisioned account is BaseAccount. Bank balance
                // is spendable; later vesting creation refuses existing accounts.
                $spendable = ExactAmount::unsigned($balance);
                $source = 'indexed_base_account';
                $provisioned = true;
            } else {
                if ($this->chain === null || !preg_match('/^1-([1-9][0-9]*)$/D', $player['id'], $owner)) {
                    throw new UnexpectedValueException('Funds need verified vault evidence');
                }
                ExactAmount::unsigned($owner[1], '18446744073709551615');
                $this->chain->verifyChain($meta['chain_id'] ?? '', $deadline);
                $vault = $this->chain->get('/structs/vault/' . rawurlencode($player['id']), $height, $deadline);
                if (($vault['ownerId'] ?? null) !== $player['id'] || !is_bool($vault['provisioned'] ?? null)
                    || !is_string($vault['address'] ?? null)
                    || !preg_match('/^structs1[02-9ac-hj-np-z]{38}$/D', $vault['address'])) {
                    throw new UnexpectedValueException('Invalid vault query response');
                }
                $provisioned = $vault['provisioned'];
                if (($address !== null && ($address !== $vault['address'] || !$provisioned))
                    || ($address === null && $provisioned)) {
                    throw new UnexpectedValueException('Indexed vault association is incomplete');
                }
                $address = $vault['address'];
                $coin = $this->chain->get('/cosmos/bank/v1beta1/spendable_balances/'
                    . rawurlencode($address) . '/by_denom?denom=ualpha', $height, $deadline)['balance'] ?? null;
                if (!is_array($coin) || ($coin['denom'] ?? null) !== 'ualpha') {
                    throw new UnexpectedValueException('Spendable coin is absent');
                }
                $spendable = ExactAmount::unsigned($coin['amount'] ?? null);
                $source = 'chain_spendable';
            }
            $player['vault_address'] = $address;
            $player['spendable_alpha_p'] = $spendable;
            $player['alpha'] = ExactAmount::alphaDisplay($spendable);
            $player['funds_meta'] = ['height' => $height, 'ready' => true, 'source' => $source,
                'provisioned' => $provisioned, 'reason' => null];
            ($this->retainedFunds ?? new RetainedFundsManager($this->chain))->apply($player, $meta, $retained, $deadline);
        } catch (Exception $error) {
            // A failed/pruned/mismatched query is unknown, never a zero balance
            // or permission to spend a retained address instead.
            $player['funds_meta']['reason'] = 'vault_evidence_unavailable';
            $meta['transaction_ready'] = false;
        }
    }
}
