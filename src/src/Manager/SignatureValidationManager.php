<?php

namespace App\Manager;

use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SignatureValidationManager
{
    public const int MSG_EXPIRY_TIME = 600; // Ten minutes

    public HttpClientInterface $httpClient;

    public function __construct(HttpClientInterface $httpClient, private string $baseUrl = 'http://structsd:1317') {
        $this->httpClient = $httpClient;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function validate(string $address, string $pubkey, string $signature, string $message):bool {

        $path = implode('/', array_map('rawurlencode', [$address, $pubkey, $signature, $message]));
        $response = $this->httpClient->request(
            'GET',
            rtrim($this->baseUrl, '/') . "/structs/validate_signature/{$path}",
            ['timeout' => 2.0, 'max_duration' => 3.0, 'max_redirects' => 0,
                'on_progress' => static function (int $downloaded): void {
                    if ($downloaded > 1048576) {
                        throw new \UnexpectedValueException('Signature validation response is too large');
                    }
                }]
        );
        try {
            $body = $response->getContent();
            if (strlen($body) > 1048576) {
                throw new \UnexpectedValueException('Signature validation response is too large');
            }
            $responseContent = json_decode($body, true, 64, JSON_THROW_ON_ERROR);
            return ($responseContent['valid'] ?? null) === true;
        } finally {
            $response->cancel();
        }
    }

    public function buildGuildMembershipJoinProxyMessage(string $guildId, string $address, int $nonce):string {
        return "GUILD{$guildId}ADDRESS{$address}NONCE{$nonce}";
    }

    public function buildLoginMessage(string $guildId, string $address, int $timestamp):string {
        return "LOGIN_GUILD{$guildId}ADDRESS{$address}DATETIME{$timestamp}";
    }

    public function isMessageTimeValid(string $messageTimestamp): bool {
        return preg_match('/^(0|[1-9][0-9]{0,18})$/D', $messageTimestamp) === 1
            && abs(time() - intval($messageTimestamp)) < self::MSG_EXPIRY_TIME;
    }
}
