<?php

namespace App\Factory;

use App\Dto\ApiRequestParamsDto;
use App\Entity\PlayerAddressPending;

class PlayerAddressPendingFactory
{
    public function makeFromRequestParams(ApiRequestParamsDto $requestParams): PlayerAddressPending {
        $playerAddressPending = new PlayerAddressPending();
        $playerAddressPending->setCode($requestParams->code);
        $playerAddressPending->setAddress($requestParams->address);
        $playerAddressPending->setSignature($requestParams->signature);
        $playerAddressPending->setPubkey($requestParams->pubkey);
        $playerAddressPending->setUserAgent($requestParams->user_agent);
        return $playerAddressPending;
    }
}