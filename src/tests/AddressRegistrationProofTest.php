<?php

use App\Manager\AddressRegistrationProofManager;
use App\Manager\ChainSnapshotManager;
use App\Manager\SignatureValidationManager;
use App\Util\ChainProtocol;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

class AddressRegistrationProofTest extends TestCase
{
    private const string ADDRESS = 'structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a';

    private function manager(array $options = []): AddressRegistrationProofManager
    {
        $height = $options['height'] ?? '3353000';
        $headReads = 0;
        $client = new MockHttpClient(function ($method, $url, $request) use ($options, $height, &$headReads) {
            $this->assertSame('GET', $method);
            $path = parse_url($url, PHP_URL_PATH);
            if (str_ends_with($path, '/syncing')) {
                return new MockResponse(json_encode(['syncing' => $options['syncing'] ?? false]));
            }
            if (str_ends_with($path, '/blocks/latest')) {
                $header = ['height' => $headReads++ ? ($options['latest_height'] ?? $height) : $height,
                    'chain_id' => $options['chain_id'] ?? ChainProtocol::CHAIN_ID];
                return new MockResponse(json_encode(['block' => ['header' => $header],
                    'sdk_block' => ['header' => array_replace($header, $options['sdk_header'] ?? [])]]));
            }
            $this->assertSame('/structs/address/' . self::ADDRESS, $path, 'Use the single-address query');
            $this->assertContains('x-cosmos-block-height: ' . $height, $request['headers']);
            $row = ['address' => self::ADDRESS, 'playerId' => '', 'proofNonce' => '0'];
            $row = array_replace($row, $options['address_row'] ?? []);
            if ($options['missing_nonce'] ?? false) unset($row['proofNonce']);
            return new MockResponse(json_encode($row), [
                'response_headers' => ($options['missing_height'] ?? false) ? []
                    : ['x-cosmos-block-height: ' . ($options['response_height'] ?? $height)],
            ]);
        });
        return new AddressRegistrationProofManager(new ChainSnapshotManager($client));
    }

    public function testExactPostUpgradeProofsIncludingRevokedAddressNonce(): void
    {
        foreach (['0', '1', '9007199254740993', '18446744073709551615'] as $nonce) {
            $context = $this->manager(['address_row' => ['proofNonce' => $nonce]])->readContext('1-137', self::ADDRESS);
            $this->assertSame($nonce, $context['proof_nonce']);
            $this->assertSame('', $context['registered_player_id']);
            $this->assertSame('0', $context['timeout_height']);
            $this->assertSame('CHAINstructstestnet-111|REGISTERADDRESSPLAYER1-137ADDRESS' . self::ADDRESS . 'NONCE' . $nonce,
                AddressRegistrationProofManager::message($context));
        }
    }

    public function testDeviceStatePreservesExactNativePermissions(): void
    {
        $state = $this->manager(['address_row' => ['permissions' => '18446744073709551615']])->readState('1-137', self::ADDRESS);
        $this->assertSame('18446744073709551615', $state['permissions']);
        $this->assertArrayNotHasKey('permissions', $this->manager()->readContext('1-137', self::ADDRESS), 'Proof response shape is unchanged');
        $this->expectException(UnexpectedValueException::class);
        $this->manager(['address_row' => ['permissions' => 127]])->readState('1-137', self::ADDRESS);
    }

    public function testLegacyProofKeepsItsFormatAndRequiresSignedExpiry(): void
    {
        $context = $this->manager(['height' => '3352999', 'missing_nonce' => true,
            'address_row' => ['playerId' => '1-0']])->readContext('1-137', self::ADDRESS);
        $this->assertNull($context['proof_nonce']);
        $this->assertSame('3352999', $context['timeout_height']);
        $this->assertSame('PLAYER1-137ADDRESS' . self::ADDRESS, AddressRegistrationProofManager::message($context));
        $context['timeout_height'] = '0';
        $this->expectException(UnexpectedValueException::class);
        AddressRegistrationProofManager::message($context);
    }

    public static function unavailableContexts(): array
    {
        return array_map(static fn (array $options): array => [$options], [
            ['syncing' => true], ['chain_id' => 'wrong-chain'], ['height' => '0'],
            ['height' => '9007199254740992'], ['sdk_header' => ['height' => '3353001']],
            ['address_row' => ['address' => 'wrong-address']], ['address_row' => ['playerId' => '1-0']],
            ['missing_nonce' => true], ['address_row' => ['proofNonce' => 0]],
            ['address_row' => ['proofNonce' => '00']], ['address_row' => ['proofNonce' => '18446744073709551616']],
            ['missing_height' => true], ['response_height' => '3352999'], ['latest_height' => '3352999'],
            ['height' => '3352999', 'latest_height' => '3353000'],
        ]);
    }

    /** @dataProvider unavailableContexts */
    public function testUnavailableOrInconsistentContextFailsClosed(array $options): void
    {
        $this->expectException(UnexpectedValueException::class);
        $this->manager($options)->readContext('1-137', self::ADDRESS);
    }

    public function testAssociatedAddressIsReportedButCannotCreateAnotherProof(): void
    {
        $context = $this->manager(['address_row' => ['playerId' => '1-137', 'proofNonce' => '7']])
            ->readContext('1-137', self::ADDRESS);
        $this->assertSame('1-137', $context['registered_player_id']);
        $this->expectException(UnexpectedValueException::class);
        AddressRegistrationProofManager::message($context);
    }

    public function testSignatureTransportEncodesTheMessageExactlyOnce(): void
    {
        $message = 'CHAINstructstestnet-111|REGISTERADDRESSPLAYER1-137ADDRESS' . self::ADDRESS . 'NONCE9007199254740993';
        $http = new MockHttpClient(function ($method, $url, $options) use ($message) {
            $this->assertSame('GET', $method);
            $last = basename(parse_url($url, PHP_URL_PATH));
            $this->assertStringContainsString('%7C', $last);
            $this->assertSame($message, rawurldecode($last));
            $this->assertSame(0, $options['max_redirects']);
            $this->assertSame(3.0, $options['max_duration']);
            return new MockResponse('{"valid":true}');
        });
        $this->assertTrue((new SignatureValidationManager($http))->validate(self::ADDRESS, 'pubkey', 'signature', $message));
    }

    public function testPhpAndBrowserUseTheSameActivationConstants(): void
    {
        $source = file_get_contents(__DIR__ . '/../js/constants/ChainConstants.js');
        foreach (['ID' => ChainProtocol::CHAIN_ID, 'UPGRADE_HEIGHT' => ChainProtocol::UPGRADE_HEIGHT,
            'LEGACY_PROTOCOL' => ChainProtocol::LEGACY, 'PROTOCOL' => ChainProtocol::CURRENT] as $name => $value) {
            $this->assertStringContainsString($name . ": '" . $value . "'", $source);
        }
    }
}
