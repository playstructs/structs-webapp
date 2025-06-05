<?php

namespace App\Controller;

use App\Manager\LedgerManager;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class LedgerController extends AbstractController
{
    /**
     * @param string $player_id
     * @param int $page
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/ledger/player/{player_id}/page/{page}', name: 'api_get_transactions')]
    public function getTransactions(
        string $player_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $ledgerManager = new LedgerManager($entityManager, $validator);
        return $ledgerManager->getTransactions($player_id, $page);
    }

    /**
     * @param string $player_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/ledger/player/{player_id}/count', name: 'api_count_transactions')]
    public function countTransactions(
        string $player_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response
    {
        $ledgerManager = new LedgerManager($entityManager, $validator);
        return $ledgerManager->countTransactions($player_id);
    }

    /**
     * @param string $tx_id
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @return Response
     * @throws Exception
     */
    #[Route('/api/ledger/{tx_id}', name: 'api_get_transaction')]
    public function getTransaction(
        string $tx_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        $ledgerManager = new LedgerManager($entityManager, $validator);
        return $ledgerManager->getTransaction($tx_id);
    }
}
