<?php

namespace App\Entity;

use App\Repository\PlayerPendingRepository;
use DateMalformedStringException;
use DateTime;
use DateTimeZone;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlayerPendingRepository::class)]
class PlayerPending
{

    #[
        ORM\Id,
        ORM\Column,
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public string $primary_address;

    #[
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $guild_id = null;

    #[
        ORM\Column,
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $signature = null;

    #[
        ORM\Column,
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $pubkey = null;

    #[
        ORM\Column,
        Assert\Regex('/^[\p{L}0-9-_]{1,20}$/')
    ]
    public ?string $username = null;

    #[
        ORM\Column,
        Assert\Json
    ]
    public ?string $pfp = null;

    #[
        ORM\Column,
        Assert\NotBlank,
        Assert\DateTime(format: 'Y-m-d H:i:sP')
    ]
    public string $created_at;

    #[
        ORM\Column,
        Assert\NotBlank,
        Assert\DateTime(format: 'Y-m-d H:i:sP')
    ]
    public string $updated_at;

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

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    /**
     * @param string $datetime
     * @return $this
     * @throws DateMalformedStringException
     */
    public function setCreatedAt(string $datetime): static
    {
        $createdAtDateTime = new DateTime($datetime, new DateTimeZone('UTC'));
        $this->created_at = $createdAtDateTime->format('Y-m-d H:i:sP');

        return $this;
    }

    /**
     * @param string $datetime
     * @return $this
     * @throws DateMalformedStringException
     */
    public function setUpdatedAt(string $datetime): static
    {
        $updatedAtDateTime = new DateTime($datetime, new DateTimeZone('UTC'));
        $this->updated_at = $updatedAtDateTime->format('Y-m-d H:i:sP');

        return $this;
    }
}
