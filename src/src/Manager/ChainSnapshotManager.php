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

    public function verifyChain(string $chainId, ?float $deadline = null): void
    {
        if ($chainId === '' || ($this->read('/cosmos/base/tendermint/v1beta1/node_info', null, $deadline)['default_node_info']['network'] ?? null) !== $chainId) {
            throw new UnexpectedValueException('Chain snapshot network mismatch');
        }
    }

    public function get(string $path, string $height, ?float $deadline = null): array
    {
        ExactAmount::unsigned($height, '9223372036854775807');
        if ($height === '0') {
            throw new UnexpectedValueException('Chain snapshot height must be positive');
        }

        return $this->read($path, $height, $deadline);
    }

    public function head(string $chainId, ?float $deadline = null): array
    {
        if (($this->read('/cosmos/base/tendermint/v1beta1/syncing', null, $deadline)['syncing'] ?? null) !== false) {
            throw new UnexpectedValueException('Chain snapshot node is not synchronized');
        }
        $block = $this->read('/cosmos/base/tendermint/v1beta1/blocks/latest', null, $deadline);
        $header = $block['sdk_block']['header'] ?? $block['block']['header'] ?? null;
        $height = ExactAmount::unsigned($header['height'] ?? null, '9007199254740991');
        if ($height === '0' || $chainId === '' || ($header['chain_id'] ?? null) !== $chainId) {
            throw new UnexpectedValueException('Chain snapshot head identity mismatch');
        }
        // SDK responses can include both old and new block envelopes.
        foreach (['block', 'sdk_block'] as $key) {
            if (isset($block[$key]) && (($block[$key]['header']['height'] ?? null) !== $height
                || ($block[$key]['header']['chain_id'] ?? null) !== $chainId)) {
                throw new UnexpectedValueException('Chain snapshot block envelopes disagree');
            }
        }

        return ['chain_id' => $chainId, 'height' => $height];
    }

    private function read(string $path, ?string $height = null, ?float $deadline = null): array
    {
        if (!str_starts_with($path, '/') || str_starts_with($path, '//')) {
            throw new UnexpectedValueException('Chain snapshot path must be local');
        }
        $remaining = $deadline === null ? 3.0 : min(3.0, $deadline - hrtime(true) / 1e9);
        if ($remaining <= 0) {
            throw new UnexpectedValueException('Chain snapshot deadline exceeded');
        }
        $response = $this->httpClient->request('GET', rtrim($this->baseUrl, '/') . $path, [
            'headers' => $height === null ? [] : ['x-cosmos-block-height' => $height],
            'timeout' => min(2.0, $remaining),
            'max_duration' => $remaining,
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
            if ($deadline !== null && hrtime(true) / 1e9 >= $deadline) {
                throw new UnexpectedValueException('Chain snapshot deadline exceeded');
            }
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
