<?php

namespace App\Factory;

use App\Dto\ApiRequestParamsDto;
use App\Entity\PlayerPending;
use DateMalformedStringException;

class PlayerPendingFactory
{
    /**
     * @param ApiRequestParamsDto $requestParams
     * @return PlayerPending
     * @throws DateMalformedStringException
     */
    public function makeFromRequestParams(ApiRequestParamsDto $requestParams): PlayerPending {
        $playerPending = new PlayerPending();
        $playerPending->setPrimaryAddress($requestParams->primary_address);
        $playerPending->setGuildId($requestParams->guild_id);
        $playerPending->setSignature($requestParams->signature);
        $playerPending->setPubkey($requestParams->pubkey);
        $playerPending->setUsername($requestParams->username);
        $playerPending->setPfp($requestParams->pfp);
        $playerPending->setCreatedAt('now');
        $playerPending->setUpdatedAt($playerPending->getCreatedAt());
        return $playerPending;
    }
}
