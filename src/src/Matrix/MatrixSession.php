<?php

namespace App\Matrix;

/**
 * What a browser needs to act as a Matrix client: the tokens, and where to
 * refresh and revoke them without the guild API in the middle.
 */
final class MatrixSession
{
    public function __construct(
        public readonly string $userId,
        public readonly string $deviceId,
        public readonly string $accessToken,
        public readonly ?string $refreshToken,
        public readonly ?int $expiresIn,
        public readonly string $clientId,
        public readonly string $tokenEndpoint,
        public readonly string $revocationEndpoint
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'user_id'             => $this->userId,
            'device_id'           => $this->deviceId,
            'access_token'        => $this->accessToken,
            'refresh_token'       => $this->refreshToken,
            'expires_in'          => $this->expiresIn,
            'client_id'           => $this->clientId,
            'token_endpoint'      => $this->tokenEndpoint,
            'revocation_endpoint' => $this->revocationEndpoint,
        ];
    }
}
