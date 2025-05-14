<?php

namespace App\Entity;

use App\Repository\PlayerAddressActivationCodeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerAddressActivationCodeRepository::class)]
class PlayerAddressActivationCode
{
    #[
        ORM\Id,
        ORM\Column
    ]
    private ?string $player_id = null;

    #[ORM\Column]
    private ?string $logged_in_address = null;

    #[
        ORM\GeneratedValue,
        ORM\Column
    ]
    private ?string $code = null;

    #[ORM\Column]
    private ?string $created_at = null;

    public function getPlayerId(): ?string
    {
        return $this->player_id;
    }

    public function setPlayerId(string $player_id): static
    {
        $this->player_id = $player_id;

        return $this;
    }

    public function getLoggedInAddress(): ?string
    {
        return $this->logged_in_address;
    }

    public function setLoggedInAddress(?string $logged_in_address): static
    {
        $this->logged_in_address = $logged_in_address;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(string $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }
}
