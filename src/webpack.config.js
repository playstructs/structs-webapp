const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    index: './js/index.js',
    test: './js/tests/test.js',
    "workers/TaskWorker": "./js/workers/TaskWorker.js",
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/js'),
    sourceMapFilename: "[name].js.map",
  },
  devtool: "source-map",
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"]
    },
    // Webpack 5 ships no Node core polyfills. @cosmjs/crypto is the only thing
    // that reaches for one, and only to probe for Node's crypto in branches a
    // browser never takes, falling back to WebCrypto or noble. An empty module
    // satisfies the probe; a real shim would drag in crypto-browserify, and
    // with it elliptic.
    fallback: {
      crypto: false
    }
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" , options: { transpileOnly: true } }
    ]
  },
  plugins: [
    // @cosmjs/utils and cosmjs-types use Buffer as a global. Nothing else in the
    // graph needs a Node global: the handful of `typeof process` reads are Node
    // detection, which must stay false here.
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer/'), 'Buffer']
    })
  ]
};
