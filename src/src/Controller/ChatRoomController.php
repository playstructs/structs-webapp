<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Manager\ChatRoomManager;
use App\Manager\SignatureValidationManager;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Throwable;

/**
 * Chat clients call this instead of creating fleet/planet rooms themselves.
 *
 * Players of this guild use their webapp session. Players of other guilds have
 * no session here, so they sign CHATROOM{kind}{id}ADDRESS{address}DATETIME{ts}
 * with their chain key. The route sits outside the session firewall for that
 * reason and authenticates here instead.
 */
class ChatRoomController extends AbstractController
{
    #[Route('/api/chat/room/ensure', name: 'api_chat_room_ensure', methods: ['POST'])]
    public function ensure(
        Request $request,
        ChatRoomManager $chatRoomManager,
        SignatureValidationManager $signatureValidationManager,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        $body = is_array($body) ? $body : [];
        $kind = (string) ($body['kind'] ?? '');
        $id = (string) ($body['id'] ?? '');

        if (!ChatRoomManager::isValidObject($kind, $id)) {
            return $this->error(Response::HTTP_BAD_REQUEST, 'invalid_object', 'kind must be fleet (9-N) or planet (2-N)');
        }

        if (!$this->isAuthenticated($request, $body, $kind, $id, $signatureValidationManager, $entityManager)) {
            return $this->error(Response::HTTP_UNAUTHORIZED, 'authentication_error', 'Login or a valid signature required');
        }

        if (!$chatRoomManager->isConfigured()) {
            return $this->error(Response::HTTP_SERVICE_UNAVAILABLE, 'chat_not_configured', 'Guild chat is not configured');
        }

        $owner = $chatRoomManager->findOwner($kind, $id);

        if ($owner === null) {
            return $this->error(Response::HTTP_NOT_FOUND, 'object_not_found', "No {$kind} {$id} on chain");
        }

        if ($owner['owner_guild_id'] !== $chatRoomManager->findLocalGuildId()) {
            $content = new ApiResponseContentDto();
            $content->errors = ['owner_in_other_guild' => 'Ask the owner guild'];
            $content->data = [
                'owner_guild_id'       => $owner['owner_guild_id'],
                'owner_guild_endpoint' => $owner['owner_guild_endpoint'],
            ];

            return new JsonResponse($content, Response::HTTP_CONFLICT);
        }

        try {
            $room = $chatRoomManager->ensureRoom($kind, $id, $owner['owner']);
        } catch (RuntimeException $exception) {
            $logger->error('chat room ensure failed', ['kind' => $kind, 'id' => $id, 'error' => $exception->getMessage()]);

            return $this->error(Response::HTTP_BAD_GATEWAY, 'homeserver_error', 'Homeserver did not accept the request');
        }

        $content = new ApiResponseContentDto();
        $content->success = true;
        $content->data = $room;

        return new JsonResponse($content, $room['created'] ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    /**
     * @param array<string, mixed> $body
     */
    private function isAuthenticated(
        Request $request,
        array $body,
        string $kind,
        string $id,
        SignatureValidationManager $signatureValidationManager,
        EntityManagerInterface $entityManager
    ): bool {
        if ($request->hasSession() && $request->getSession()->get('player_id') !== null) {
            return true;
        }

        $address = (string) ($body['address'] ?? '');
        $pubkey = (string) ($body['pubkey'] ?? '');
        $signature = (string) ($body['signature'] ?? '');
        $timestamp = (string) ($body['unix_timestamp'] ?? '');

        if ($address === '' || $pubkey === '' || $signature === '' || !ctype_digit($timestamp)) {
            return false;
        }

        try {
            $valid = $signatureValidationManager->isMessageTimeValid($timestamp)
                && $signatureValidationManager->validate(
                    $address,
                    $pubkey,
                    $signature,
                    $signatureValidationManager->buildChatRoomMessage($kind, $id, $address, (int) $timestamp)
                );
        } catch (Throwable) {
            return false;
        }

        return $valid && $entityManager->getConnection()->fetchOne(
            "SELECT 1 FROM player_address WHERE address = :address AND status = 'approved' LIMIT 1",
            ['address' => $address]
        ) !== false;
    }

    private function error(int $status, string $code, string $message): JsonResponse
    {
        $content = new ApiResponseContentDto();
        $content->errors = [$code => $message];

        return new JsonResponse($content, $status);
    }
}
