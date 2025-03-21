<?php

namespace App\Entity;

use App\Repository\PlayerAddressPendingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerAddressPendingRepository::class)]
class PlayerAddressPending extends AbstractEntity
{
    #[
        ORM\Id,
        ORM\Column
    ]
    public string $address;

    #[ORM\Column]
    public ?string $signature = null;

    #[ORM\Column]
    public ?string $pubkey = null;

    #[ORM\Column]
    public ?string $code = null;

    #[ORM\Column]
    public ?string $ip = null;

    #[ORM\Column]
    public ?string $user_agent = null;

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

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

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function setIp(?string $ip): static
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
}
