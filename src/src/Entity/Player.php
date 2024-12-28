<?php

namespace App\Entity;

use App\Repository\PlayerRepository;
use DateMalformedStringException;
use DateTime;
use DateTimeZone;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlayerRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_ID', fields: ['id'])]
class Player implements UserInterface
{
    #[
        ORM\Id,
        ORM\Column,
        Assert\NotBlank,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public string $id;

    /**
     * @var list<string> The user roles
     */
    private array $roles = [];

    #[
        ORM\Column,
        Assert\Regex('/^[0-9]+$/')
    ]
    public ?int $index = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $creator = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9]+$/')
    ]
    public ?string $primary_address = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $guild_id = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $substation_id = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $planet_id = null;

    #[
        ORM\Column,
        Assert\Regex('/^[a-zA-Z0-9\-]+$/')
    ]
    public ?string $fleet_id = null;

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

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): static
    {
        $this->id = $id;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return $this->id;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getIndex(): ?int
    {
        return $this->index;
    }

    public function setIndex(int $index): static
    {
        $this->index = $index;

        return $this;
    }

    public function getCreator(): ?string
    {
        return $this->creator;
    }

    public function setCreator(string $creator): static
    {
        $this->creator = $creator;

        return $this;
    }

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

    public function getSubstationId(): ?string
    {
        return $this->substation_id;
    }

    public function setSubstationId(string $substation_id): static
    {
        $this->substation_id = $substation_id;

        return $this;
    }

    public function getPlanetId(): ?string
    {
        return $this->planet_id;
    }

    public function setPlanetId(string $planet_id): static
    {
        $this->planet_id = $planet_id;

        return $this;
    }

    public function getFleetId(): ?string
    {
        return $this->fleet_id;
    }

    public function setFleetId(string $fleet_id): static
    {
        $this->fleet_id = $fleet_id;

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

    public function getUpdatedAt(): string
    {
        return $this->updated_at;
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
