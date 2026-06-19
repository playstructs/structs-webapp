<?php

namespace App\Service;

use RuntimeException;

/**
 * Dependency-free PNG compositor.
 *
 * Decodes 8-bit RGBA, non-interlaced PNGs into raw pixels, stacks them
 * back-to-front using source-over alpha blending, and re-encodes the result.
 * Relies only on PHP's built-in zlib functions (gzuncompress / gzcompress).
 */
class PngCompositor
{
    private const string SIGNATURE = "\x89PNG\r\n\x1a\n";

    /**
     * Composite the given PNG files (already ordered back to front) and
     * return the resulting PNG as a binary string.
     *
     * @param string[] $filePaths
     */
    public function composite(array $filePaths, int $width, int $height): string
    {
        $base = array_fill(0, $width * $height * 4, 0);

        foreach ($filePaths as $path) {
            $layer = $this->decode($path);

            if ($layer['width'] !== $width || $layer['height'] !== $height) {
                throw new RuntimeException(sprintf('Layer "%s" is not %dx%d.', $path, $width, $height));
            }

            $this->blendOver($base, $layer['pixels']);
        }

        return $this->encode($base, $width, $height);
    }

    /**
     * Decode a PNG file into flat RGBA pixel data.
     *
     * @return array{width:int,height:int,pixels:int[]}
     */
    private function decode(string $path): array
    {
        $raw = @file_get_contents($path);

        if ($raw === false) {
            throw new RuntimeException(sprintf('Unable to read PNG "%s".', $path));
        }

        if (substr($raw, 0, 8) !== self::SIGNATURE) {
            throw new RuntimeException(sprintf('"%s" is not a PNG.', $path));
        }

        $offset = 8;
        $length = strlen($raw);
        $width = 0;
        $height = 0;
        $idat = '';

        while ($offset < $length) {
            $chunkLength = unpack('N', substr($raw, $offset, 4))[1];
            $type = substr($raw, $offset + 4, 4);
            $data = substr($raw, $offset + 8, $chunkLength);
            $offset += 12 + $chunkLength;

            if ($type === 'IHDR') {
                $header = unpack('Nwidth/Nheight/Cdepth/Ccolor/Ccompression/Cfilter/Cinterlace', $data);
                $width = $header['width'];
                $height = $header['height'];

                if ($header['depth'] !== 8 || $header['color'] !== 6) {
                    throw new RuntimeException(sprintf('"%s" must be 8-bit RGBA.', $path));
                }

                if ($header['interlace'] !== 0) {
                    throw new RuntimeException(sprintf('"%s" must not be interlaced.', $path));
                }
            } elseif ($type === 'IDAT') {
                $idat .= $data;
            } elseif ($type === 'IEND') {
                break;
            }
        }

        $inflated = @gzuncompress($idat);

        if ($inflated === false) {
            throw new RuntimeException(sprintf('Unable to inflate "%s".', $path));
        }

        return [
            'width' => $width,
            'height' => $height,
            'pixels' => $this->unfilter($inflated, $width, $height),
        ];
    }

    /**
     * Reverse the per-scanline PNG filters, returning flat RGBA bytes.
     *
     * @return int[]
     */
    private function unfilter(string $data, int $width, int $height): array
    {
        $bpp = 4;
        $stride = $width * $bpp;
        $bytes = array_values(unpack('C*', $data));
        $pixels = [];
        $prevRow = array_fill(0, $stride, 0);
        $pos = 0;

        for ($y = 0; $y < $height; $y++) {
            $filter = $bytes[$pos++];
            $row = array_fill(0, $stride, 0);

            for ($x = 0; $x < $stride; $x++) {
                $value = $bytes[$pos++];
                $left = $x >= $bpp ? $row[$x - $bpp] : 0;
                $up = $prevRow[$x];
                $upLeft = $x >= $bpp ? $prevRow[$x - $bpp] : 0;

                $recon = match ($filter) {
                    0 => $value,
                    1 => $value + $left,
                    2 => $value + $up,
                    3 => $value + intdiv($left + $up, 2),
                    4 => $value + $this->paeth($left, $up, $upLeft),
                    default => throw new RuntimeException('Unsupported PNG filter type.'),
                };

                $row[$x] = $recon & 0xFF;
            }

            foreach ($row as $byte) {
                $pixels[] = $byte;
            }

            $prevRow = $row;
        }

        return $pixels;
    }

    private function paeth(int $a, int $b, int $c): int
    {
        $p = $a + $b - $c;
        $pa = abs($p - $a);
        $pb = abs($p - $b);
        $pc = abs($p - $c);

        if ($pa <= $pb && $pa <= $pc) {
            return $a;
        }

        return $pb <= $pc ? $b : $c;
    }

    /**
     * Source-over alpha composite of $src onto $base, in place.
     *
     * @param int[] $base
     * @param int[] $src
     */
    private function blendOver(array &$base, array $src): void
    {
        $count = count($base);

        for ($i = 0; $i < $count; $i += 4) {
            $sa = $src[$i + 3];

            if ($sa === 0) {
                continue;
            }

            if ($sa === 255) {
                $base[$i] = $src[$i];
                $base[$i + 1] = $src[$i + 1];
                $base[$i + 2] = $src[$i + 2];
                $base[$i + 3] = 255;
                continue;
            }

            $da = $base[$i + 3];
            $saf = $sa / 255;
            $daf = $da / 255;
            $oaf = $saf + $daf * (1 - $saf);

            if ($oaf <= 0) {
                $base[$i] = 0;
                $base[$i + 1] = 0;
                $base[$i + 2] = 0;
                $base[$i + 3] = 0;
                continue;
            }

            for ($c = 0; $c < 3; $c++) {
                $sc = $src[$i + $c];
                $dc = $base[$i + $c];
                $base[$i + $c] = (int) round(($sc * $saf + $dc * $daf * (1 - $saf)) / $oaf);
            }

            $base[$i + 3] = (int) round($oaf * 255);
        }
    }

    /**
     * Encode flat RGBA pixel data into a PNG binary string.
     *
     * @param int[] $pixels
     */
    private function encode(array $pixels, int $width, int $height): string
    {
        $stride = $width * 4;
        $rawData = '';

        for ($y = 0; $y < $height; $y++) {
            $rawData .= "\x00"; // filter type: none
            $offset = $y * $stride;
            $rawData .= pack('C*', ...array_slice($pixels, $offset, $stride));
        }

        $ihdr = pack('NNCCCCC', $width, $height, 8, 6, 0, 0, 0);

        return self::SIGNATURE
            . $this->chunk('IHDR', $ihdr)
            . $this->chunk('IDAT', gzcompress($rawData, 9))
            . $this->chunk('IEND', '');
    }

    private function chunk(string $type, string $data): string
    {
        return pack('N', strlen($data))
            . $type
            . $data
            . pack('N', crc32($type . $data) & 0xFFFFFFFF);
    }
}
