# Webpack asset deployment

Build with the existing production webpack command. JavaScript entry and worker
filenames include their content hash. `public/js/manifest.json` maps the logical
entry names to those files; Symfony's named `webpack` asset package resolves
the main page through that manifest and refuses a missing entry/build.

Deploy the generated manifest, bundles, worker chunks and source maps with the
matching PHP/templates. Prepare and validate the complete release directory
before switching the served application. Retain the previous release's hashed
chunks while its pages may still be open; webpack deliberately does not clean
old outputs. Do not overwrite a hashed file with different bytes. Clear/warm
the Symfony cache when switching configuration/templates as usual.

A new page resolves the current bundle and that bundle references its matching
worker. This does not force an already-open page to reload, cancel a previously
signed transaction, or make pre-upgrade clients understand new rules. The
protocol/readiness and durable outcome guards remain required. Static scripts,
styles and UI markup are otherwise unchanged.

Run `node tools/assets/test.cjs` with the same `STRUCTS_NODE_MODULES` and
`NODE_PATH` settings as the wire suite. It performs real production builds and
proves that a worker-only change updates both URLs while old assets remain
available. Also build the complete application, render the Symfony page and
exercise a real browser worker before deployment.
