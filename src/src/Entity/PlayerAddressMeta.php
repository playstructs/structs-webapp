<?php

namespace App\Entity;

use App\Repository\PlayerAddressMetaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerAddressMetaRepository::class)]
class PlayerAddressMeta
{
    #[
        ORM\Id,
        ORM\Column
    ]
    private ?string $address = null;

    #[ORM\Column]
    private ?string $ip = null;

    #[ORM\Column]
    private ?string $user_agent = null;

    #[ORM\Column]
    private string $updated_at;

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function setIp(string $ip): static
    {
        $this->ip = $ip;

        return $this;
    }

    public function getUserAgent(): ?string
    {
        return $this->user_agent;
    }

    public function setUserAgent(?string $user_agent): static
    {
        $this->user_agent = $user_agent;

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
