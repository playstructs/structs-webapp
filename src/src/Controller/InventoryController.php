<?php

namespace App\Controller;

use App\Manager\InventoryManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class InventoryController extends AbstractController
{
    private const string PAGE_REQUIREMENT = '\d+';

    private function manager(EntityManagerInterface $em, ValidatorInterface $v): InventoryManager
    {
        return new InventoryManager($em, $v);
    }

    /**
     * @throws Exception
     */
    #[Route(
        '/api/inventory/denom/{denom}/page/{page}',
        name: 'api_inventory_by_denom',
        requirements: ['page' => self::PAGE_REQUIREMENT],
        methods: ['GET']
    )]
    public function inventoryByDenom(
        string $denom,
        int $page,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->inventoryByDenom(
            $denom,
            $page,
            $request->query->get('limit')
        );
    }

    /**
     * @throws Exception
     */
    #[Route(
        '/api/inventory/owner/{owner_type}/{owner_id}',
        name: 'api_inventory_by_owner',
        methods: ['GET']
    )]
    public function inventoryByOwner(
        string $owner_type,
        string $owner_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->inventoryByOwner($owner_type, $owner_id);
    }

    /**
     * @throws Exception
     */
    #[Route('/api/guild-bank', name: 'api_guild_bank', methods: ['GET'])]
    public function getGuildBank(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->getGuildBank();
    }

    /**
     * @throws Exception
     */
    #[Route('/api/guild-bank/{guild_id}/history', name: 'api_guild_bank_history', methods: ['GET'])]
    public function getGuildBankHistory(
        string $guild_id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->getGuildBankHistory(
            $guild_id,
            $request->query->get('bucket')
        );
    }
}
