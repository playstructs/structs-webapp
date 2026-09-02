<?php

use App\Dto\ApiResponseContentDto;
use PHPUnit\Framework\TestCase;

class ApiResponseContentDtoTest extends TestCase
{
    /**
     * GuildAPIResponseFactory requires success/errors/data and ignores the rest,
     * so the optional fields must stay absent unless they were set.
     */
    public function testOmitsUnsetTotalAndMeta(): void
    {
        $dto = new ApiResponseContentDto();
        $dto->success = true;
        $dto->errors = [];
        $dto->data = ['count' => 1];

        $encoded = json_decode(json_encode($dto), true);
        $this->assertSame(['success', 'errors', 'data'], array_keys($encoded));
        $this->assertArrayNotHasKey('total', $encoded);
        $this->assertArrayNotHasKey('meta', $encoded);
    }

    public function testIncludesTotalAndMetaWhenSet(): void
    {
        $dto = new ApiResponseContentDto();
        $dto->success = true;
        $dto->total = 42;
        $dto->meta = ['height' => 7];

        $encoded = json_decode(json_encode($dto), true);
        $this->assertSame(42, $encoded['total']);
        $this->assertSame(['height' => 7], $encoded['meta']);
    }
}
