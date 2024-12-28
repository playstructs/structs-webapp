<?php

namespace App\Factory;

use App\Dto\LoginCredentialsDto;

class LoginCredentialsDtoFactory
{
    public function makeFromArray(array $loginData):LoginCredentialsDto {
        $loginCredentialsDto = new LoginCredentialsDto();
        $loginCredentialsDto->address = $loginData['primary_address'] ?? null;
        $loginCredentialsDto->guild_id = $loginData['guild_id'] ?? null;
        $loginCredentialsDto->signature = $loginData['signature'] ?? null;
        $loginCredentialsDto->pubkey = $loginData['pubkey'] ?? null;
        return $loginCredentialsDto;
    }
}