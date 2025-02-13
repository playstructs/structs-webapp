const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const path = require('path');

module.exports = {
  entry: {
    index: './js/index.js',
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
  plugins: [
    new NodePolyfillPlugin()
  ]
};
