<?php

namespace App\Oidc;

use RuntimeException;

/**
 * Publishes the RSA public key as a JWK Set so MAS can verify ID tokens.
 *
 * Built from the PEM on disk rather than stored separately, so the advertised
 * key can never drift from the key that actually signs.
 */
class JwksBuilder
{
    public function __construct(private readonly OidcConfig $config)
    {
    }

    /**
     * @return array{keys: list<array<string, string>>}
     */
    public function build(): array
    {
        return ['keys' => [$this->buildKey()]];
    }

    /**
     * @return array<string, string>
     */
    private function buildKey(): array
    {
        $key = openssl_pkey_get_public($this->config->readPublicKey());

        if ($key === false) {
            throw new RuntimeException('OIDC public key could not be parsed as a public key');
        }

        $details = openssl_pkey_get_details($key);

        if ($details === false || !isset($details['rsa']['n'], $details['rsa']['e'])) {
            throw new RuntimeException('OIDC public key is not an RSA key');
        }

        return [
            'kty' => 'RSA',
            'use' => 'sig',
            'alg' => 'RS256',
            'kid' => $this->config->getKeyId(),
            'n'   => $this->base64Url($details['rsa']['n']),
            'e'   => $this->base64Url($details['rsa']['e']),
        ];
    }

    private function base64Url(string $binary): string
    {
        return rtrim(strtr(base64_encode($binary), '+/', '-_'), '=');
    }
}
