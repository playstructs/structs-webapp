<?php

namespace App\Entity;

use App\Repository\PlayerPendingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerPendingRepository::class)]
class PlayerPending extends AbstractEntity
{
    #[
        ORM\Id,
        ORM\Column
    ]
    public string $primary_address;

    #[ORM\Column]
    public ?string $guild_id = null;

    #[ORM\Column]
    public ?string $signature = null;

    #[ORM\Column]
    public ?string $pubkey = null;

    #[ORM\Column]
    public ?string $username = null;

    #[ORM\Column]
    public ?string $pfp = null;

    public function getPrimaryAddress(): ?string
    {
        return $this->primary_address;
    }

    public function setPrimaryAddress(string $primary_address): static
    {
        $this->primary_address = $primary_address;

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

    public function getSignature(): ?string
    {
        return $this->signature;
    }

    public function setSignature(?string $signature): static
    {
        $this->signature = $signature;

        return $this;
    }

    public function getPubkey(): ?string
    {
        return $this->pubkey;
    }

    public function setPubkey(?string $pubkey): static
    {
        $this->pubkey = $pubkey;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getPfp(): ?string
    {
        return $this->pfp;
    }

    public function setPfp(?string $pfp): static
    {
        $this->pfp = $pfp;

        return $this;
    }
}
