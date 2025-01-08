<?php

namespace App\Entity;

use App\Repository\PlayerAddressRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerAddressRepository::class)]
class PlayerAddress extends AbstractEntity
{
    #[
        ORM\Id,
        ORM\Column
    ]
    public string $address;

    #[ORM\Column]
    public ?string $player_id = null;

    #[ORM\Column]
    public ?string $guild_id = null;

    #[ORM\Column]
    public ?string $status = null;

    #[ORM\Column]
    public string $created_at;

    #[ORM\Column]
    public string $updated_at;

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getPlayerId(): ?string
    {
        return $this->player_id;
    }

    public function setPlayerId(string $player_id): static
    {
        $this->player_id = $player_id;

        return $this;
    }

    public function getGuildId(): ?string
    {
        return $this->guild_id;
    }

    public function setGuildId(string $guild_id): static
    {
        $this->guild_id = $guild_id;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

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

    public function getUpdatedAt(): ?string
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(string $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }
}
