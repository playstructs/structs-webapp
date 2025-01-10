<?php

use App\Entity\AbstractEntity;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class  FieldGetterTraitTest extends KernelTestCase
{
    public function testGet() {
        $entity = new class extends AbstractEntity {
            public string $player_id = '';

            public string $guild_id = '';

            function getPlayerId(): string
            {
                return $this->player_id;
            }

            function getGuildId(): string
            {
                return 'Guild ID: ' . $this->guild_id;
            }
        };

        $entity->player_id = '1-99999';
        $entity->guild_id = '0-1';

        $this->assertSame($entity->getPlayerId(), '1-99999');
        $this->assertSame($entity->get('player_id'), '1-99999');
        $this->assertSame($entity->getGuildId(), 'Guild ID: 0-1');
        $this->assertSame($entity->get('guild_id'), 'Guild ID: 0-1');
    }
}