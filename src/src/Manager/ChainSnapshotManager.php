<?php

namespace App\Manager;

use App\Util\ExactAmount;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use UnexpectedValueException;

/** Narrow LCD reads; every state response must prove the requested height. */
class ChainSnapshotManager
{
    private const int MAX_RESPONSE_BYTES = 1048576;

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl = 'http://structsd:1317'
    ) {
    }

    public function verifyChain(string $chainId): void
    {
        if ($chainId === '' || ($this->read('/cosmos/base/tendermint/v1beta1/node_info')['default_node_info']['network'] ?? null) !== $chainId) {
            throw new UnexpectedValueException('Chain snapshot network mismatch');
        }
    }

    public function get(string $path, string $height): array
    {
        ExactAmount::unsigned($height, '9223372036854775807');
        if ($height === '0') {
            throw new UnexpectedValueException('Chain snapshot height must be positive');
        }

        return $this->read($path, $height);
    }

    private function read(string $path, ?string $height = null): array
    {
        if (!str_starts_with($path, '/') || str_starts_with($path, '//')) {
            throw new UnexpectedValueException('Chain snapshot path must be local');
        }
        $response = $this->httpClient->request('GET', rtrim($this->baseUrl, '/') . $path, [
            'headers' => $height === null ? [] : ['x-cosmos-block-height' => $height],
            'timeout' => 2,
            'max_duration' => 3,
            'max_redirects' => 0,
            'on_progress' => static function (int $downloaded): void {
                if ($downloaded > self::MAX_RESPONSE_BYTES) {
                    throw new UnexpectedValueException('Chain snapshot response is too large');
                }
            },
        ]);
        try {
            if ($response->getStatusCode() !== 200) {
                throw new UnexpectedValueException('Chain snapshot query failed');
            }
            if ($height !== null) {
                $headers = $response->getHeaders(false);
                $found = false;
                foreach (['x-cosmos-block-height', 'grpc-metadata-x-cosmos-block-height'] as $name) {
                    foreach ($headers[$name] ?? [] as $actual) {
                        $found = true;
                        if ($actual !== $height) {
                            throw new UnexpectedValueException('Chain snapshot response height mismatch');
                        }
                    }
                }
                if (!$found) {
                    throw new UnexpectedValueException('Chain snapshot response height is absent');
                }
            }
            $body = $response->getContent(false);
            if (strlen($body) > self::MAX_RESPONSE_BYTES) {
                throw new UnexpectedValueException('Chain snapshot response is too large');
            }
            $result = json_decode($body, true, 64, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING);
            if (!is_array($result) || !str_starts_with(ltrim($body), '{')) {
                throw new UnexpectedValueException('Chain snapshot envelope is invalid');
            }

            return $result;
        } finally {
            $response->cancel();
        }
    }
}
