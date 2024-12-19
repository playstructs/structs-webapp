<?php

namespace App\Factory;

use App\Entity\PlayerPending;
use DateMalformedStringException;

class PlayerPendingFactory
{
    /**
     * @param array $playerData
     * @return PlayerPending
     * @throws DateMalformedStringException
     */
    public function makeFromArray(array $playerData): PlayerPending {
        $playerPending = new PlayerPending();
        $playerPending->setPrimaryAddress($playerData['primary_address'] ?? null);
        $playerPending->setSignature($playerData['signature'] ?? null);
        $playerPending->setPubkey($playerData['pubkey'] ?? null);
        $playerPending->setUsername($playerData['username'] ?? null);
        $playerPending->setPfp($playerData['pfp'] ?? null);
        $playerPending->setCreatedAt($playerData['created_at'] ?? 'now');
        $playerPending->setUpdatedAt($playerData['updated_at'] ?? $playerPending->getCreatedAt());
        return $playerPending;
    }
}
