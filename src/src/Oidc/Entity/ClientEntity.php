<?php

namespace App\Oidc\Entity;

use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\Traits\ClientTrait;
use League\OAuth2\Server\Entities\Traits\EntityTrait;

class ClientEntity implements ClientEntityInterface
{
    use ClientTrait;
    use EntityTrait;

    /**
     * @var string[]
     */
    private array $grantTypes = [];

    /**
     * @var string[]
     */
    private array $scopes = [];

    /**
     * @param string[] $redirectUris
     * @param string[] $grantTypes
     * @param string[] $scopes
     */
    public function __construct(
        string $identifier,
        private readonly string $guildId,
        string $name,
        array $redirectUris,
        array $grantTypes,
        array $scopes,
        bool $isConfidential
    ) {
        $this->setIdentifier($identifier);
        $this->name = $name;
        $this->redirectUri = $redirectUris;
        $this->grantTypes = $grantTypes;
        $this->scopes = $scopes;
        $this->isConfidential = $isConfidential;
    }

    /**
     * The only guild whose players this client may authenticate.
     *
     * One webapp can serve several guilds' Matrix deployments through a single
     * issuer, so this is what keeps one guild's identity provider from minting
     * tokens for another guild's players.
     */
    public function getGuildId(): string
    {
        return $this->guildId;
    }

    /**
     * Consulted by League\OAuth2\Server\Grant\AbstractGrant. Returning false
     * for refresh_token is what keeps this provider from ever minting one.
     */
    public function supportsGrantType(string $grantType): bool
    {
        return in_array($grantType, $this->grantTypes, true);
    }

    /**
     * @return string[]
     */
    public function getAllowedScopes(): array
    {
        return $this->scopes;
    }
}
