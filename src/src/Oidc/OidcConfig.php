<?php

namespace App\Oidc;

use RuntimeException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Deployment configuration for the OpenID Connect provider.
 *
 * Every guild webapp is its own issuer, so all of this is environment driven
 * rather than committed. Nothing here reaches the database except the client
 * registration, which is seeded by app:oidc:seed-client.
 */
class OidcConfig
{
    public const string SCOPE_OPENID = 'openid';

    public const string SCOPE_PROFILE = 'profile';

    /**
     * Authorization codes are exchanged immediately by MAS, so the window only
     * has to cover one server-to-server round trip.
     */
    public const string AUTH_CODE_TTL = 'PT2M';

    public const string ACCESS_TOKEN_TTL = 'PT1H';

    /**
     * How long a parked authorization request survives while the player
     * completes a wallet login in the SPA.
     */
    public const string AUTHORIZE_REQUEST_TTL = 'PT10M';

    public function __construct(
        #[Autowire(env: 'bool:OIDC_ENABLED')]
        private readonly bool $enabled,
        #[Autowire(env: 'OIDC_ISSUER')]
        private readonly string $issuer,
        #[Autowire(env: 'OIDC_MAS_CLIENT_ID')]
        private readonly string $masClientId,
        #[Autowire(env: 'OIDC_MAS_CLIENT_SECRET')]
        private readonly string $masClientSecret,
        #[Autowire(env: 'OIDC_MAS_REDIRECT_URI')]
        private readonly string $masRedirectUri,
        #[Autowire(env: 'OIDC_JWT_PRIVATE_KEY_PATH')]
        private readonly string $privateKeyPath,
        #[Autowire(env: 'OIDC_JWT_PUBLIC_KEY_PATH')]
        private readonly string $publicKeyPath,
        #[Autowire(env: 'OIDC_JWT_KEY_ID')]
        private readonly string $keyId,
        #[Autowire(env: 'OIDC_ENCRYPTION_KEY')]
        private readonly string $encryptionKey,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir
    ) {
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * The issuer string MAS is configured with. It must match byte for byte,
     * so a stray trailing slash is normalised away rather than shipped.
     */
    public function getIssuer(): string
    {
        return rtrim($this->issuer, '/');
    }

    public function getMasClientId(): string
    {
        return $this->masClientId;
    }

    public function getMasClientSecret(): string
    {
        return $this->masClientSecret;
    }

    public function getMasRedirectUri(): string
    {
        return $this->masRedirectUri;
    }

    public function getKeyId(): string
    {
        return $this->keyId;
    }

    public function getPrivateKeyPath(): string
    {
        return $this->absolutePath($this->privateKeyPath);
    }

    public function getPublicKeyPath(): string
    {
        return $this->absolutePath($this->publicKeyPath);
    }

    /**
     * @throws RuntimeException when the key has not been generated or mounted
     */
    public function readPublicKey(): string
    {
        $path = $this->getPublicKeyPath();
        $contents = is_readable($path) ? file_get_contents($path) : false;

        if ($contents === false || trim($contents) === '') {
            throw new RuntimeException("OIDC public key is missing or unreadable at {$path}");
        }

        return $contents;
    }

    public function getEncryptionKey(): string
    {
        return $this->encryptionKey;
    }

    /**
     * @return string[]
     */
    public function getSupportedScopes(): array
    {
        return [self::SCOPE_OPENID, self::SCOPE_PROFILE];
    }

    public function url(string $path): string
    {
        return $this->getIssuer() . $path;
    }

    /**
     * Every value the provider needs before it can serve traffic. Returned as a
     * list so the seed command and the discovery endpoint report the same
     * problems in the same words.
     *
     * @return string[]
     */
    public function findConfigurationErrors(): array
    {
        $errors = [];

        if ($this->getIssuer() === '') {
            $errors[] = 'OIDC_ISSUER is not set';
        } elseif (!str_starts_with($this->getIssuer(), 'https://') && !str_starts_with($this->getIssuer(), 'http://')) {
            $errors[] = 'OIDC_ISSUER must be an absolute URL';
        }

        if ($this->masClientId === '') {
            $errors[] = 'OIDC_MAS_CLIENT_ID is not set';
        }

        if ($this->masRedirectUri === '') {
            $errors[] = 'OIDC_MAS_REDIRECT_URI is not set';
        }

        if ($this->encryptionKey === '') {
            $errors[] = 'OIDC_ENCRYPTION_KEY is not set';
        }

        if (!is_readable($this->getPrivateKeyPath())) {
            $errors[] = "OIDC_JWT_PRIVATE_KEY_PATH is not readable at {$this->getPrivateKeyPath()}";
        }

        if (!is_readable($this->getPublicKeyPath())) {
            $errors[] = "OIDC_JWT_PUBLIC_KEY_PATH is not readable at {$this->getPublicKeyPath()}";
        }

        return $errors;
    }

    private function absolutePath(string $path): string
    {
        return str_starts_with($path, '/') ? $path : $this->projectDir . '/' . $path;
    }
}
