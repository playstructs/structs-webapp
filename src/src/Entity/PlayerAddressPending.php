<?php

namespace App\Entity;

use App\Repository\PlayerAddressPendingRepository;
use App\Trait\PsqlTimestampTrait;
use DateMalformedStringException;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerAddressPendingRepository::class)]
class PlayerAddressPending
{
    use PsqlTimestampTrait;

    #[
        ORM\Id,
        ORM\Column
    ]
    private string $address;

    #[ORM\Column]
    private ?string $signature = null;

    #[ORM\Column]
    private ?string $pubkey = null;

    #[ORM\Column]
    private ?string $code = null;

    #[ORM\Column]
    private ?string $ip = null;

    #[ORM\Column]
    private ?string $user_agent = null;

    #[ORM\Column]
    private string $created_at;

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

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    /**
     * @param string $created_at
     * @return $this
     * @throws DateMalformedStringException
     */
    public function setCreatedAt(string $created_at): static
    {
        $this->created_at = $this->formatTimestamp($created_at);

        return $this;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updated_at;
    }

    /**
     * @param string $updated_at
     * @return $this
     * @throws DateMalformedStringException
     */
    public function setUpdatedAt(string $updated_at): static
    {
        $this->updated_at = $this->formatTimestamp($updated_at);

        return $this;
    }
}
