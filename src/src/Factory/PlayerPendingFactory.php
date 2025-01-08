<?php

namespace App\Factory;

use App\Dto\ApiRequestParamsDto;
use App\Entity\PlayerPending;

class PlayerPendingFactory
{
    public function makeFromRequestParams(ApiRequestParamsDto $requestParams): PlayerPending {
        $playerPending = new PlayerPending();
        $playerPending->setPrimaryAddress($requestParams->primary_address);
        $playerPending->setGuildId($requestParams->guild_id);
        $playerPending->setSignature($requestParams->signature);
        $playerPending->setPubkey($requestParams->pubkey);
        $playerPending->setUsername($requestParams->username);
        $playerPending->setPfp($requestParams->pfp);
        return $playerPending;
    }
}
