<?php

namespace App\Oidc;

use App\Manager\OidcClaimsManager;
use App\Oidc\Entity\ClientEntity;
use App\Oidc\Repository\AuthCodeRepository;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\ResponseTypes\BearerTokenResponse;
use RuntimeException;
use SensitiveParameter;

/**
 * Adds the OIDC `id_token` to the standard OAuth2 token response.
 *
 * The library has no notion of OpenID Connect; extending the bearer response is
 * its documented extension point for doing so.
 */
class IdTokenResponse extends BearerTokenResponse
{
    public function __construct(
        private readonly OidcConfig $config,
        private readonly OidcClaimsManager $claimsManager,
        private readonly AuthCodeRepository $authCodeRepository,
        private readonly IdTokenContext $idTokenContext
    ) {
    }

    /**
     * {@inheritdoc}
     *
     * @return array<array-key, mixed>
     */
    protected function getExtraParams(
        #[SensitiveParameter]
        AccessTokenEntityInterface $accessToken
    ): array {
        $scopes = array_map(
            static fn ($scope): string => $scope->getIdentifier(),
            $accessToken->getScopes()
        );

        if (!in_array(OidcConfig::SCOPE_OPENID, $scopes, true)) {
            return [];
        }

        $playerId = $accessToken->getUserIdentifier();
        $client = $accessToken->getClient();

        if ($playerId === null || !$client instanceof ClientEntity) {
            return [];
        }

        $player = $this->claimsManager->findEligiblePlayer($playerId, $client->getGuildId());

        if ($player === null) {
            // Eligibility was checked at authorize time. Losing it between then
            // and the exchange means the player was revoked mid-flow, so the
            // access token stands but no identity is asserted.
            return [];
        }

        return ['id_token' => $this->buildIdToken($accessToken, $player, $scopes)];
    }

    /**
     * @param array<string, mixed> $player
     * @param string[]             $scopes
     */
    private function buildIdToken(
        AccessTokenEntityInterface $accessToken,
        array $player,
        array $scopes
    ): string {
        $issuedAt = new DateTimeImmutable();
        $claims = $this->claimsManager->buildClaims($player, $scopes);

        $builder = $this->jwtConfiguration()->builder()
            ->issuedBy($this->config->getIssuer())
            ->permittedFor($accessToken->getClient()->getIdentifier())
            ->relatedTo($claims['sub'])
            ->issuedAt($issuedAt)
            ->expiresAt($accessToken->getExpiryDateTime())
            ->withHeader('kid', $this->config->getKeyId());

        $authCodeId = $this->idTokenContext->getAuthCodeId();
        $nonce = $authCodeId === null ? null : $this->authCodeRepository->getNonce($authCodeId);

        if ($nonce !== null && $nonce !== '') {
            $builder = $builder->withClaim('nonce', $nonce);
        }

        unset($claims['sub']);

        foreach ($claims as $name => $value) {
            $builder = $builder->withClaim($name, $value);
        }

        $configuration = $this->jwtConfiguration();

        return $builder
            ->getToken($configuration->signer(), $configuration->signingKey())
            ->toString();
    }

    private function jwtConfiguration(): Configuration
    {
        $privateKey = $this->privateKey->getKeyContents();

        if ($privateKey === '') {
            throw new RuntimeException('OIDC private key is empty; cannot sign an ID token');
        }

        return Configuration::forAsymmetricSigner(
            new Sha256(),
            InMemory::plainText($privateKey, $this->privateKey->getPassPhrase() ?? ''),
            InMemory::plainText($this->config->readPublicKey())
        );
    }
}
