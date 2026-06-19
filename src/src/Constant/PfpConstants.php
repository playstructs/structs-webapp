<?php

namespace App\Constant;

class PfpConstants
{
    const int IMAGE_SIZE = 72;

    const int DEFAULT_INDEX = 1;

    const string ASSET_DIR = 'public/img/pfp';

    const string PLACEHOLDER_PATH = 'public/img/portrait-placeholder.png';

    const string CACHE_DIR = 'var/pfp';

    /**
     * Layer keys ordered back to front (paint order).
     * Mirrors src/js/view_models/components/PfpViewerComponent.js.
     */
    const array LAYER_ORDER = ['background', 'arms', 'body', 'neck', 'head'];

    /**
     * Number of assets available per layer (1-indexed).
     * Mirrors src/js/constants/PfpConstants.js.
     */
    const array PART_COUNTS = [
        'head' => 87,
        'neck' => 10,
        'body' => 57,
        'arms' => 34,
        'background' => 6,
    ];
}
