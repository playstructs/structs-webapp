<?php

namespace App\Manager;

use App\Util\ChainIdentity;
use App\Util\ChainProtocol;
use App\Util\ExactAmount;
use UnexpectedValueException;

/**
 * Reads address registration state from the chain's single-address query
 * rather than the indexer, and builds the message the player must sign.
 */
class AddressRegistrationProofManager
{
    public function __construct(private ChainSnapshotManager $chain)
    {
    }

    /**
     * @param string $playerId
     * @param string $address
     * @return array
     */
    public function readContext(string $playerId, string $address): array
    {
        return $this->readAddress($playerId, $address, false);
    }

    /**
     * @param string $playerId
     * @param string $address
     * @return array
     */
    public function readState(string $playerId, string $address): array
    {
        return $this->readAddress($playerId, $address, true);
    }

    /**
     * @param string $playerId
     * @param string $address
     * @param bool $withPermissions
     * @return array
     * @throws UnexpectedValueException
     */
    private function readAddress(
        string $playerId,
        string $address,
        bool $withPermissions
    ): array {
        self::validateIdentity($playerId, $address);

        $deadline = hrtime(true) / 1e9 + 15.0;
        $head = $this->chain->head(ChainProtocol::CHAIN_ID, $deadline);
        $protocol = ChainProtocol::atHeight($head['chain_id'], $head['height']);
        $row = $this->chain->get(
            '/structs/address/' . rawurlencode($address),
            $head['height'],
            $deadline
        );

        if (($row['address'] ?? null) !== $address || !is_string($row['playerId'] ?? null)) {
            throw new UnexpectedValueException('Address proof query identity mismatch');
        }

        $owner = $row['playerId'];

        // The legacy query formats the absent index zero as a non-existent player.
        if ($protocol === ChainProtocol::LEGACY && $owner === '1-0') {
            $owner = '';
        }

        if ($owner !== '') {
            self::validateIdentity($owner, $address);
        }

        $nonce = $protocol === ChainProtocol::CURRENT
            ? ExactAmount::unsigned($row['proofNonce'] ?? null, '18446744073709551615')
            : null;

        $latest = $this->chain->head(ChainProtocol::CHAIN_ID, $deadline);

        if (
            (int) $latest['height'] < (int) $head['height']
            || ChainProtocol::atHeight($latest['chain_id'], $latest['height']) !== $protocol
        ) {
            throw new UnexpectedValueException('Registration proof protocol changed during query');
        }

        return [
            'chain_id' => $head['chain_id'],
            'protocol' => $protocol,
            'source_height' => $head['height'],
            'player_id' => $playerId,
            'address' => $address,
            'proof_nonce' => $nonce,
            'registered_player_id' => $owner,
            'timeout_height' => $protocol === ChainProtocol::LEGACY
                ? ChainProtocol::legacyTimeoutHeight()
                : '0'
        ] + ($withPermissions
            ? ['permissions' => ExactAmount::unsigned($row['permissions'] ?? null, '18446744073709551615')]
            : []);
    }

    /**
     * Builds the registration message the player signs for the given context.
     *
     * @param array $context
     * @return string
     * @throws UnexpectedValueException
     */
    public static function message(array $context): string
    {
        $playerId = $context['player_id'] ?? '';
        $address = $context['address'] ?? '';

        self::validateIdentity($playerId, $address);

        $protocol = ChainProtocol::atHeight(
            $context['chain_id'] ?? '',
            $context['source_height'] ?? ''
        );

        if (
            ($context['protocol'] ?? null) !== $protocol
            || ($context['registered_player_id'] ?? null) !== ''
        ) {
            throw new UnexpectedValueException('Registration proof context is stale or already associated');
        }

        if ($protocol === ChainProtocol::LEGACY) {
            if (
                ($context['proof_nonce'] ?? null) !== null
                || ($context['timeout_height'] ?? null) !== ChainProtocol::legacyTimeoutHeight()
            ) {
                throw new UnexpectedValueException('Legacy registration requires pre-upgrade expiry');
            }

            return "PLAYER{$playerId}ADDRESS{$address}";
        }

        $nonce = ExactAmount::unsigned($context['proof_nonce'] ?? null, '18446744073709551615');

        if (($context['timeout_height'] ?? null) !== '0') {
            throw new UnexpectedValueException('Unexpected registration proof expiry');
        }

        return "CHAIN{$context['chain_id']}|REGISTERADDRESSPLAYER{$playerId}ADDRESS{$address}NONCE{$nonce}";
    }

    /**
     * @param string $playerId
     * @param string $address
     * @return void
     * @throws UnexpectedValueException
     */
    public static function validateIdentity(string $playerId, string $address): void
    {
        if (!ChainIdentity::isObjectId($playerId, 1) || !ChainIdentity::isAddress($address)) {
            throw new UnexpectedValueException('Invalid registration proof identity');
        }

        // The signature validator and chain handler independently bind the pubkey to this address.
    }
}
