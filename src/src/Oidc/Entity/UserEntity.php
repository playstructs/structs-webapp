<?php

namespace App\Oidc\Entity;

use League\OAuth2\Server\Entities\Traits\EntityTrait;
use League\OAuth2\Server\Entities\UserEntityInterface;

/**
 * The subject of an authorization request. The identifier is the immutable
 * chain player ID, which becomes the `sub` claim and therefore the Matrix
 * localpart.
 */
class UserEntity implements UserEntityInterface
{
    use EntityTrait;

    public function __construct(string $playerId)
    {
        $this->setIdentifier($playerId);
    }
}
