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

    public function __construct(HttpClientInterface $httpClient) {
        $this->httpClient = $httpClient;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function validate(string $address, string $pubkey, string $signature, string $message):bool {

        $response = $this->httpClient->request(
            'GET',
            "http://structsd:1317/structs/validate_signature/{$address}/{$pubkey}/{$signature}/{$message}"
        );
        $responseContent = json_decode($response->getContent(), true);

        return $responseContent['valid'] === true;
    }

    public function buildGuildMembershipJoinProxyMessage(string $guildId, string $address, int $nonce):string {
        return "GUILD{$guildId}ADDRESS{$address}NONCE{$nonce}";
    }

    public function buildLoginMessage(string $guildId, string $address, int $timestamp):string {
        return "LOGIN_GUILD{$guildId}ADDRESS{$address}DATETIME{$timestamp}";
    }

    public function buildAddressRegisterMessage(string $playerId, string $address):string {
        return "PLAYER{$playerId}ADDRESS{$address}";
    }

    public function isMessageTimeValid(string $messageTimestamp): bool {
        return (time() - intval($messageTimestamp)) < self::MSG_EXPIRY_TIME;
    }
}