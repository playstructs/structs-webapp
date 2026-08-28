<?php

namespace App\Oidc;

/**
 * Carries the authorization code identity across a single token request.
 *
 * The library's response type only receives the access token, but an ID token
 * also needs the nonce that the client sent at authorize time. ScopeRepository
 * sees the authorization code during the exchange and records it here so
 * IdTokenResponse can look the nonce up.
 *
 * Request-scoped by construction: one PHP process handles one token request.
 */
class IdTokenContext
{
    private ?string $authCodeId = null;

    public function setAuthCodeId(string $authCodeId): void
    {
        $this->authCodeId = $authCodeId;
    }

    public function getAuthCodeId(): ?string
    {
        return $this->authCodeId;
    }

    public function reset(): void
    {
        $this->authCodeId = null;
    }
}
