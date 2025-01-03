<?php

namespace App\Factory;

use App\Dto\ApiRequestParamsDto;
use App\Entity\PlayerAddressPending;
use DateMalformedStringException;

class PlayerAddressPendingFactory
{
    /**
     * @param ApiRequestParamsDto $requestParams
     * @return PlayerAddressPending
     * @throws DateMalformedStringException
     */
    public function makeFromRequestParams(ApiRequestParamsDto $requestParams): PlayerAddressPending {
        $playerAddressPending = new PlayerAddressPending();
        $playerAddressPending->setAddress($requestParams->address);
        $playerAddressPending->setSignature($requestParams->signature);
        $playerAddressPending->setPubkey($requestParams->pubkey);
        $playerAddressPending->setCode($requestParams->code);
        $playerAddressPending->setIp($requestParams->ip);
        $playerAddressPending->setUserAgent($requestParams->user_agent);
        $playerAddressPending->setCreatedAt('now');
        $playerAddressPending->setUpdatedAt($playerAddressPending->getCreatedAt());
        return $playerAddressPending;
    }
}