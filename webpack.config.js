const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  externals: [nodeExternals()],
  entry: "./index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "build.js",
  },
  optimization: {
    minimize: false, // enabling this reduces file size and readability
  },
};
